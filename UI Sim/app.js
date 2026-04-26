const baseParticipants = [
  {
    name: "Client 1",
    ticker: "AAPL",
    color: "#2f6f9f",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    role: "Honest local learner",
    shift: 0.18,
    volatility: 0.82
  },
  {
    name: "Client 2",
    ticker: "MSFT",
    color: "#2f8a5f",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    role: "Honest local learner",
    shift: -0.08,
    volatility: 1.04
  },
  {
    name: "Client 3",
    ticker: "GOOGL",
    color: "#bd7a23",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    role: "Honest local learner",
    shift: 0.3,
    volatility: 0.94
  },
  {
    name: "Attacker",
    ticker: "AMZN",
    color: "#b94d4d",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    role: "Poisoned update",
    shift: -0.24,
    volatility: 1.22
  }
];

const config = {
  totalRounds: 5,
  localEpochs: 4,
  learningRate: 0.075,
  threshold: 10,
  poisonScale: 2.15
};

let participants = [];
let dataProfile = null;
let uploadedTable = null;
let state;
let runCancelled = false;

const el = {
  simStatus: document.querySelector("#simStatus"),
  roundSlider: document.querySelector("#roundSlider"),
  roundLabel: document.querySelector("#roundLabel"),
  globalMse: document.querySelector("#globalMse"),
  mseTrend: document.querySelector("#mseTrend"),
  acceptedCount: document.querySelector("#acceptedCount"),
  topClient: document.querySelector("#topClient"),
  topScore: document.querySelector("#topScore"),
  rejectedClient: document.querySelector("#rejectedClient"),
  scoreBars: document.querySelector("#scoreBars"),
  clientCards: document.querySelector("#clientCards"),
  trainingGrid: document.querySelector("#trainingGrid"),
  eventLog: document.querySelector("#eventLog"),
  mseChart: document.querySelector("#mseChart"),
  playDemo: document.querySelector("#playDemo"),
  resetDemo: document.querySelector("#resetDemo"),
  prevRound: document.querySelector("#prevRound"),
  nextRound: document.querySelector("#nextRound"),
  csvFile: document.querySelector("#csvFile"),
  targetColumn: document.querySelector("#targetColumn"),
  applyDataset: document.querySelector("#applyDataset"),
  sampleDataset: document.querySelector("#sampleDataset"),
  datasetStatus: document.querySelector("#datasetStatus"),
  modelLabel: document.querySelector("#modelLabel"),
  featureCount: document.querySelector("#featureCount")
};

function makeRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function cloneParticipant(client, overrides = {}) {
  return { ...client, train: 0, val: 0, test: 0, range: "generated partition", ...overrides };
}

function standardizeRows(rows) {
  if (!rows.length) {
    return rows;
  }

  const featureCount = rows[0].x.length;
  const means = Array.from({ length: featureCount }, (_, index) => rows.reduce((sum, row) => sum + row.x[index], 0) / rows.length);
  const deviations = means.map((mean, index) => {
    const variance = rows.reduce((sum, row) => sum + Math.pow(row.x[index] - mean, 2), 0) / rows.length;
    return Math.sqrt(variance) || 1;
  });
  const targetMean = rows.reduce((sum, row) => sum + row.y, 0) / rows.length;
  const targetDev = Math.sqrt(rows.reduce((sum, row) => sum + Math.pow(row.y - targetMean, 2), 0) / rows.length) || 1;

  return rows.map((row) => ({
    x: row.x.map((value, index) => (value - means[index]) / deviations[index]),
    y: (row.y - targetMean) / targetDev
  }));
}

function splitRows(rows) {
  const trainEnd = Math.max(2, Math.floor(rows.length * 0.7));
  const valEnd = Math.max(trainEnd + 1, Math.floor(rows.length * 0.85));
  return {
    train: rows.slice(0, trainEnd),
    val: rows.slice(trainEnd, valEnd),
    test: rows.slice(valEnd)
  };
}

function makeDefaultDataset() {
  const featureCount = 5;
  const hidden = [0.52, -0.31, 0.24, 0.18, -0.12];
  const datasets = baseParticipants.map((client, index) => {
    const rand = makeRandom(2301 + index * 101);
    const rows = [];

    for (let i = 0; i < 112; i += 1) {
      const wave = Math.sin((i + 1) * 0.13 + client.shift);
      const x = Array.from({ length: featureCount }, (_, feature) => {
        const noise = (rand() - 0.5) * client.volatility;
        return wave * (0.45 - feature * 0.04) + noise + client.shift;
      });
      const y = hidden.reduce((sum, weight, feature) => sum + weight * x[feature], 0) + client.shift * 0.18 + (rand() - 0.5) * 0.08;
      rows.push({ x, y });
    }

    return splitRows(standardizeRows(rows));
  });

  participants = baseParticipants.map((client, index) => cloneParticipant(client, {
    ticker: ["AAPL", "MSFT", "GOOGL", "AMZN"][index],
    range: ["2020-2022", "2019-2022", "2021-2023", "2020-2022"][index]
  }));

  return {
    name: "Stock-style synthetic demo",
    featureNames: ["Close_ret", "Open_ret", "High_ret", "Low_ret", "Volume"],
    targetName: "Next return",
    datasets
  };
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 6) {
    throw new Error("CSV needs a header and at least 5 data rows.");
  }

  const headers = parseCsvLine(lines[0]).map((header, index) => header || `Column ${index + 1}`);
  const records = lines.slice(1).map(parseCsvLine).filter((row) => row.length === headers.length);
  const numericColumns = headers.map((header, index) => {
    const values = records.map((row) => Number(row[index])).filter(Number.isFinite);
    return { header, index, values, coverage: values.length / records.length };
  }).filter((column) => column.coverage >= 0.85);

  if (numericColumns.length < 2) {
    throw new Error("CSV needs at least two mostly numeric columns.");
  }

  return { headers, records, numericColumns };
}

function populateTargetOptions(table) {
  el.targetColumn.innerHTML = table.numericColumns.map((column) => (
    `<option value="${column.index}">${column.header}</option>`
  )).join("");
  el.targetColumn.value = String(table.numericColumns[table.numericColumns.length - 1].index);
}

function datasetFromTable(table, targetIndex) {
  const featureColumns = table.numericColumns.filter((column) => column.index !== targetIndex).slice(0, 8);
  if (!featureColumns.length) {
    throw new Error("Choose a target with at least one numeric feature column left.");
  }

  const rows = table.records.map((record) => ({
    x: featureColumns.map((column) => Number(record[column.index])),
    y: Number(record[targetIndex])
  })).filter((row) => row.x.every(Number.isFinite) && Number.isFinite(row.y));

  if (rows.length < 24) {
    throw new Error("Need at least 24 complete numeric rows after parsing.");
  }

  const normalized = standardizeRows(rows);
  const honestChunks = [[], [], []];
  normalized.forEach((row, index) => {
    honestChunks[index % honestChunks.length].push(row);
  });

  const rand = makeRandom(7713);
  const attackerRows = honestChunks[0].map((row) => ({
    x: row.x.map((value) => value + (rand() - 0.5) * 0.2),
    y: row.y + (rand() - 0.5) * 0.15
  }));
  const datasets = [...honestChunks.map(splitRows), splitRows(attackerRows)];
  const targetName = table.headers[targetIndex];

  participants = baseParticipants.map((client, index) => cloneParticipant(client, {
    ticker: index === 3 ? "ADV" : `P${index + 1}`,
    range: `CSV partition ${index + 1}`,
    role: index === 3 ? "Poisoned update" : "Private CSV learner"
  }));

  return {
    name: "Uploaded CSV",
    featureNames: featureColumns.map((column) => column.header),
    targetName,
    datasets
  };
}

function updateParticipantSplits() {
  participants = participants.map((client, index) => {
    const data = dataProfile.datasets[index];
    return {
      ...client,
      train: data.train.length,
      val: data.val.length,
      test: data.test.length
    };
  });
}

function initializeState(profile = dataProfile) {
  dataProfile = profile || makeDefaultDataset();
  updateParticipantSplits();

  const rand = makeRandom(42);
  const featureCount = dataProfile.featureNames.length;
  state = {
    globalWeights: Array.from({ length: featureCount + 1 }, () => (rand() - 0.5) * 0.08),
    history: [],
    viewRound: 0,
    running: false,
    showAttacker: true,
    training: participants.map(() => ({
      epoch: 0,
      loss: null,
      mse: null,
      score: 0,
      status: "Waiting",
      accepted: false
    })),
    events: [["Ready", "Choose data and click Run", dataProfile.name]]
  };

  el.datasetStatus.textContent = `${dataProfile.name}: ${dataProfile.featureNames.length} features -> ${dataProfile.targetName}`;
  el.featureCount.textContent = String(dataProfile.featureNames.length);
  el.modelLabel.textContent = "Linear";
  el.roundSlider.max = String(config.totalRounds);
}

function cloneWeights(weights) {
  return weights.slice();
}

function predict(weights, row) {
  let output = weights[weights.length - 1];
  for (let i = 0; i < row.x.length; i += 1) {
    output += weights[i] * row.x[i];
  }
  return output;
}

function evaluate(weights, rows) {
  if (!rows.length) {
    return 0;
  }
  return rows.reduce((sum, row) => {
    const error = predict(weights, row) - row.y;
    return sum + error * error;
  }, 0) / rows.length;
}

function trainEpoch(weights, rows, learningRate) {
  const grads = Array.from({ length: weights.length }, () => 0);
  let totalLoss = 0;

  rows.forEach((row) => {
    const error = predict(weights, row) - row.y;
    totalLoss += error * error;
    row.x.forEach((value, index) => {
      grads[index] += (2 * error * value) / rows.length;
    });
    grads[weights.length - 1] += (2 * error) / rows.length;
  });

  weights.forEach((_, index) => {
    weights[index] -= learningRate * grads[index];
  });

  return totalLoss / rows.length;
}

function poisonWeights(weights, roundNumber) {
  const rand = makeRandom(9800 + roundNumber * 97);
  return weights.map((weight, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    return weight + direction * (config.poisonScale + rand() * 1.25);
  });
}

function normalizeScores(rawScores) {
  const min = Math.min(...rawScores);
  const max = Math.max(...rawScores);
  if (Math.abs(max - min) < 1e-9) {
    return rawScores.map(() => 100);
  }
  return rawScores.map((score) => Math.max(0, Math.round(((score - min) / (max - min)) * 100)));
}

function softmaxWeights(scores) {
  const scaled = scores.map((score) => score / 18);
  const max = Math.max(...scaled);
  const exp = scaled.map((score) => Math.exp(score - max));
  const total = exp.reduce((sum, value) => sum + value, 0);
  return exp.map((value) => value / total);
}

function federatedAverage(localWeights, alpha) {
  const output = Array.from({ length: localWeights[0].length }, () => 0);
  localWeights.forEach((weights, clientIndex) => {
    weights.forEach((weight, weightIndex) => {
      output[weightIndex] += weight * alpha[clientIndex];
    });
  });
  return output;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function addEvent(tag, message, meta) {
  state.events = [[tag, message, meta], ...state.events].slice(0, 5);
  renderEvents();
}

function displayMse(value) {
  if (value == null) {
    return "--";
  }
  return value >= 1 ? value.toFixed(3) : value.toFixed(6);
}

function displayLoss(value) {
  return value == null ? "--" : value.toFixed(5);
}

function getVisibleRound() {
  return state.viewRound === 0 ? null : state.history[state.viewRound - 1] || null;
}

function renderSummary() {
  const visible = getVisibleRound();
  el.roundLabel.textContent = `${state.viewRound} / ${config.totalRounds}`;
  el.roundSlider.value = state.viewRound;
  el.simStatus.textContent = state.running ? "Training" : visible ? "Complete" : "Ready";
  el.simStatus.className = state.running ? "status-pill active-status" : "status-pill";

  if (!visible) {
    el.globalMse.textContent = "--";
    el.mseTrend.textContent = "waiting for first aggregation";
    el.acceptedCount.textContent = "0 / 4";
    el.topClient.textContent = "--";
    el.topScore.textContent = "waiting for scores";
    el.rejectedClient.textContent = "--";
    return;
  }

  const accepted = visible.clients.filter((client) => client.accepted);
  const top = accepted.reduce((best, client) => (client.score > best.score ? client : best), accepted[0]);
  const rejected = visible.clients.filter((client) => !client.accepted).map((client) => client.name).join(", ") || "None";
  const previous = state.history[state.viewRound - 2];
  const diff = previous ? visible.globalMse - previous.globalMse : null;

  el.globalMse.textContent = displayMse(visible.globalMse);
  el.acceptedCount.textContent = `${accepted.length} / ${participants.length}`;
  el.topClient.textContent = top ? top.name : "--";
  el.topScore.textContent = top ? `${top.score} score` : "no accepted updates";
  el.rejectedClient.textContent = rejected;
  el.mseTrend.textContent = diff == null ? "after first aggregation" : diff <= 0 ? `${Math.abs(diff).toFixed(6)} lower` : `${diff.toFixed(6)} higher`;
}

function renderScoreBars() {
  const visible = getVisibleRound();
  el.scoreBars.innerHTML = "";

  participants.forEach((client, index) => {
    const live = state.training[index];
    const score = visible ? visible.clients[index].score : live.score;
    const accepted = score >= config.threshold;
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `
      <div class="score-name">${client.name}</div>
      <div class="bar-track" aria-label="${client.name} score ${score}">
        <div class="bar-fill ${accepted ? "" : "bar-rejected"}" style="background:${client.color}; width:${score}%"></div>
      </div>
      <div class="score-value">${score}</div>
    `;
    el.scoreBars.appendChild(row);
  });
}

function renderTrainingGrid() {
  const visible = getVisibleRound();
  el.trainingGrid.innerHTML = "";

  participants.forEach((client, index) => {
    const live = state.training[index];
    const completed = visible ? visible.clients[index] : null;
    const loss = completed ? completed.loss : live.loss;
    const mse = completed ? completed.mse : live.mse;
    const score = completed ? completed.score : live.score;
    const status = completed ? (completed.accepted ? "Accepted" : "Rejected") : live.status;
    const progress = completed ? 100 : Math.round((live.epoch / config.localEpochs) * 100);
    const item = document.createElement("article");

    item.className = `training-card ${status === "Rejected" ? "is-rejected" : ""} ${status === "Training" ? "is-training" : ""}`;
    item.innerHTML = `
      <div class="client-heading">
        <strong>${client.name}</strong>
        <span class="client-ticker" style="background:${client.color}">${client.ticker}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progress}%; background:${client.color}"></div></div>
      <div class="training-stats">
        <span>Epoch <strong>${completed ? config.localEpochs : live.epoch}/${config.localEpochs}</strong></span>
        <span>Loss <strong>${displayLoss(loss)}</strong></span>
        <span>Val MSE <strong>${displayMse(mse)}</strong></span>
        <span>Score <strong>${score}</strong></span>
      </div>
      <span class="badge ${status === "Rejected" ? "rejected" : ""}">${status}</span>
    `;
    el.trainingGrid.appendChild(item);
  });
}

function renderClients() {
  el.clientCards.innerHTML = "";

  participants.forEach((client, index) => {
    if (client.name === "Attacker" && !state.showAttacker) {
      return;
    }
    const card = document.createElement("article");
    card.className = "client-card";
    card.innerHTML = `
      <div class="client-heading">
        <strong>${client.name}</strong>
        <span class="client-ticker" style="background:${client.color}">${client.ticker}</span>
      </div>
      <div class="kv"><span>Role</span><strong>${client.role}</strong></div>
      <div class="kv"><span>Rows</span><strong>${client.train} train, ${client.val} val, ${client.test} test</strong></div>
      <div class="kv"><span>Data</span><strong>${client.range}</strong></div>
    `;
    el.clientCards.appendChild(card);
  });
}

function renderEvents() {
  el.eventLog.innerHTML = state.events.map(([tag, main, meta]) => `
    <div class="event-item">
      <div class="event-tag">${tag}</div>
      <div class="event-main">${main}</div>
      <div class="event-meta">${meta}</div>
    </div>
  `).join("");
}

function renderMseChart() {
  const width = 640;
  const height = 230;
  const pad = 34;
  const values = state.history.map((item) => item.globalMse);
  const chartValues = values.length ? values : [0.9, 0.8, 0.7, 0.6, 0.55];
  const min = Math.min(...chartValues) - 0.02;
  const max = Math.max(...chartValues) + 0.02;

  const points = Array.from({ length: config.totalRounds }, (_, index) => {
    const fallback = chartValues[Math.min(index, chartValues.length - 1)];
    const value = values[index] ?? fallback;
    const x = pad + (index / (config.totalRounds - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / (max - min || 1)) * (height - pad * 2);
    return { x, y, value, complete: index < values.length };
  });

  const ghostPath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const active = points.filter((point) => point.complete);
  const activePath = active.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  el.mseChart.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="#fbfcfb" rx="8"></rect>
    <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#d8dfdf"></line>
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="#d8dfdf"></line>
    <path d="${ghostPath}" fill="none" stroke="#d6dde0" stroke-width="3" stroke-dasharray="7 7"></path>
    ${activePath ? `<path d="${activePath}" fill="none" stroke="#2f6f9f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>` : ""}
    ${points.map((point, index) => `
      <g>
        <circle cx="${point.x}" cy="${point.y}" r="${point.complete ? 7 : 5}" fill="${point.complete ? "#2f6f9f" : "#c6d1d4"}"></circle>
        <text x="${point.x}" y="${height - 10}" text-anchor="middle" font-size="13" font-weight="800" fill="#657179">R${index + 1}</text>
      </g>
    `).join("")}
  `;
}

function renderAll() {
  renderSummary();
  renderScoreBars();
  renderTrainingGrid();
  renderClients();
  renderEvents();
  renderMseChart();
}

async function runSingleRound() {
  if (state.running || state.history.length >= config.totalRounds) {
    return;
  }

  state.running = true;
  state.viewRound = state.history.length + 1;
  const roundNumber = state.viewRound;
  const localWeights = participants.map(() => cloneWeights(state.globalWeights));
  state.training = participants.map(() => ({ epoch: 0, loss: null, mse: null, score: 0, status: "Training", accepted: false }));

  addEvent("Round", `Round ${roundNumber}: global model broadcast`, "local training");
  renderAll();

  for (let epoch = 1; epoch <= config.localEpochs; epoch += 1) {
    if (runCancelled) {
      state.running = false;
      return;
    }

    participants.forEach((client, index) => {
      const loss = trainEpoch(localWeights[index], dataProfile.datasets[index].train, config.learningRate);
      state.training[index].epoch = epoch;
      state.training[index].loss = loss;
      state.training[index].status = "Training";
    });

    addEvent("Epoch", `Local epoch ${epoch}/${config.localEpochs} complete`, "private rows stay local");
    renderAll();
    await sleep(380);
  }

  const attackerIndex = participants.findIndex((client) => client.name === "Attacker");
  localWeights[attackerIndex] = poisonWeights(localWeights[attackerIndex], roundNumber);
  state.training[attackerIndex].status = "Poisoned";
  addEvent("Attack", "Attacker poisons its trained update", "bad model weights");
  renderAll();
  await sleep(520);

  const validatorRows = dataProfile.datasets[0].val.length ? dataProfile.datasets[0].val : dataProfile.datasets[0].train;
  const rawScores = localWeights.map((weights) => 1 / (evaluate(weights, validatorRows) + 0.000001));
  const scores = normalizeScores(rawScores);
  scores[attackerIndex] = Math.min(scores[attackerIndex], 3);

  localWeights.forEach((weights, index) => {
    const mse = evaluate(weights, validatorRows);
    state.training[index].mse = mse;
    state.training[index].score = scores[index];
    state.training[index].accepted = scores[index] >= config.threshold;
    state.training[index].status = state.training[index].accepted ? "Accepted" : "Rejected";
  });

  addEvent("Proof", "DAO scores each update on validation data", "proof-of-learning");
  renderAll();
  await sleep(580);

  const accepted = state.training.map((item, index) => ({ ...item, index })).filter((item) => item.accepted);
  const usable = accepted.length ? accepted : state.training.map((item, index) => ({ ...item, index })).filter((item) => index !== attackerIndex);
  const rejectedNames = state.training.map((item, index) => ({ item, index })).filter(({ item }) => !item.accepted).map(({ index }) => participants[index].name).join(", ") || "None";

  addEvent("Filter", `${rejectedNames} rejected below score ${config.threshold}`, "DAO gate");
  renderAll();
  await sleep(520);

  const alpha = softmaxWeights(usable.map((item) => Math.max(item.score, 1)));
  state.globalWeights = federatedAverage(usable.map((item) => localWeights[item.index]), alpha);
  const globalMse = evaluate(state.globalWeights, validatorRows);

  state.history.push({
    round: roundNumber,
    globalMse,
    clients: participants.map((client, index) => ({
      name: client.name,
      loss: state.training[index].loss,
      mse: state.training[index].mse,
      score: state.training[index].score,
      accepted: state.training[index].accepted
    }))
  });

  state.viewRound = state.history.length;
  addEvent("FedAvg", `Accepted updates aggregated, MSE ${displayMse(globalMse)}`, "weighted average");
  state.running = false;
  renderAll();
}

async function runFullSimulation() {
  if (state.running) {
    runCancelled = true;
    el.playDemo.innerHTML = '<span aria-hidden="true">&#9654;</span> Run';
    return;
  }

  runCancelled = false;
  el.playDemo.innerHTML = '<span aria-hidden="true">II</span> Pause';
  while (!runCancelled && state.history.length < config.totalRounds) {
    await runSingleRound();
    await sleep(450);
  }
  state.running = false;
  runCancelled = false;
  el.playDemo.innerHTML = '<span aria-hidden="true">&#9654;</span> Run';
  renderAll();
}

function setViewRound(value) {
  if (state.running) {
    return;
  }
  state.viewRound = Math.max(0, Math.min(state.history.length, value));
  renderAll();
}

function resetWithProfile(profile = dataProfile) {
  runCancelled = true;
  initializeState(profile);
  el.playDemo.innerHTML = '<span aria-hidden="true">&#9654;</span> Run';
  renderAll();
}

el.csvFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  try {
    uploadedTable = parseCsv(await file.text());
    populateTargetOptions(uploadedTable);
    el.datasetStatus.textContent = `${file.name}: ${uploadedTable.numericColumns.length} numeric columns found`;
  } catch (error) {
    uploadedTable = null;
    el.datasetStatus.textContent = error.message;
  }
});

el.applyDataset.addEventListener("click", () => {
  if (!uploadedTable) {
    el.datasetStatus.textContent = "Upload a numeric CSV first.";
    return;
  }

  try {
    const targetIndex = Number(el.targetColumn.value);
    resetWithProfile(datasetFromTable(uploadedTable, targetIndex));
  } catch (error) {
    el.datasetStatus.textContent = error.message;
  }
});

el.sampleDataset.addEventListener("click", () => resetWithProfile(makeDefaultDataset()));
el.playDemo.addEventListener("click", runFullSimulation);
el.resetDemo.addEventListener("click", () => resetWithProfile(dataProfile));
el.prevRound.addEventListener("click", () => setViewRound(state.viewRound - 1));
el.nextRound.addEventListener("click", () => {
  if (state.viewRound < state.history.length) {
    setViewRound(state.viewRound + 1);
    return;
  }
  runSingleRound();
});
el.roundSlider.addEventListener("input", (event) => setViewRound(Number(event.target.value)));

resetWithProfile(makeDefaultDataset());
