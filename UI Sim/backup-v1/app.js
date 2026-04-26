const participants = [
  {
    name: "Client 1",
    ticker: "AAPL",
    range: "2020-01-01 to 2022-12-31",
    train: 507,
    val: 109,
    test: 109,
    color: "#2f6f9f",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    role: "Honest local learner"
  },
  {
    name: "Client 2",
    ticker: "MSFT",
    range: "2019-06-01 to 2022-06-30",
    train: 521,
    val: 112,
    test: 112,
    color: "#2f8a5f",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    role: "Honest local learner"
  },
  {
    name: "Client 3",
    ticker: "GOOGL",
    range: "2021-01-01 to 2023-12-31",
    train: 505,
    val: 108,
    test: 109,
    color: "#bd7a23",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    role: "Honest local learner"
  },
  {
    name: "Attacker",
    ticker: "AMZN",
    range: "2020-01-01 to 2022-12-31",
    train: 507,
    val: 109,
    test: 109,
    color: "#b94d4d",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    role: "Poisoned update"
  }
];

const rounds = [
  {
    round: 1,
    scores: [99, 81, 99, 0],
    trainLoss: [0.052942, 0.042638, 0.063877, null],
    valMse: [0.008747, 0.010698, 0.008759, 5058.178316],
    globalMse: 0.00841965237144134
  },
  {
    round: 2,
    scores: [99, 89, 90, 0],
    trainLoss: [0.012636, 0.008832, 0.01831, null],
    valMse: [0.008399, 0.009363, 0.009249, 1574.82653],
    globalMse: 0.008399288507530618
  },
  {
    round: 3,
    scores: [99, 92, 89, 0],
    trainLoss: [0.012436, 0.007901, 0.018729, null],
    valMse: [0.00841, 0.009116, 0.009426, 5297.282333],
    globalMse: 0.008409849884476165
  },
  {
    round: 4,
    scores: [99, 99, 94, 0],
    trainLoss: [0.011766, 0.007786, 0.018299, null],
    valMse: [0.008372, 0.008399, 0.008846, 2912.396278],
    globalMse: 0.008375602152014217
  },
  {
    round: 5,
    scores: [97, 99, 75, 0],
    trainLoss: [0.011346, 0.008548, 0.017962, null],
    valMse: [0.008733, 0.008489, 0.01126, 2599.196038],
    globalMse: 0.008468752134419447
  }
];

const threshold = 10;
let currentRound = 0;
let timer = null;
let showAttackDetails = true;

const roundSlider = document.querySelector("#roundSlider");
const roundLabel = document.querySelector("#roundLabel");
const globalMse = document.querySelector("#globalMse");
const mseTrend = document.querySelector("#mseTrend");
const acceptedCount = document.querySelector("#acceptedCount");
const topClient = document.querySelector("#topClient");
const topScore = document.querySelector("#topScore");
const rejectedClient = document.querySelector("#rejectedClient");
const scoreBars = document.querySelector("#scoreBars");
const clientCards = document.querySelector("#clientCards");
const eventLog = document.querySelector("#eventLog");
const mseChart = document.querySelector("#mseChart");

function formatMse(value) {
  return value >= 1 ? value.toFixed(3) : value.toFixed(8);
}

function roundData() {
  return rounds[currentRound];
}

function acceptedIndexes(data) {
  return data.scores.map((score, index) => ({ score, index })).filter((item) => item.score >= threshold);
}

function renderSummary() {
  const data = roundData();
  const accepted = acceptedIndexes(data);
  const winner = accepted.reduce((best, item) => (item.score > best.score ? item : best), accepted[0]);
  const previous = rounds[currentRound - 1];

  roundLabel.textContent = `${data.round} / ${rounds.length}`;
  roundSlider.value = data.round;
  globalMse.textContent = formatMse(data.globalMse);
  acceptedCount.textContent = `${accepted.length} / ${participants.length}`;
  topClient.textContent = participants[winner.index].name;
  topScore.textContent = `${winner.score} score`;
  rejectedClient.textContent = participants.find((_, index) => data.scores[index] < threshold)?.name || "None";

  if (!previous) {
    mseTrend.textContent = "after first aggregation";
    return;
  }

  const diff = data.globalMse - previous.globalMse;
  mseTrend.textContent = diff <= 0 ? `${Math.abs(diff).toFixed(8)} lower than previous` : `${diff.toFixed(8)} higher than previous`;
}

function renderScoreBars() {
  const data = roundData();
  scoreBars.innerHTML = "";

  participants.forEach((client, index) => {
    const score = data.scores[index];
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `
      <div class="score-name">${client.name}</div>
      <div class="bar-track" aria-label="${client.name} score ${score}">
        <div class="bar-fill" style="background:${client.color}; width:${score}%"></div>
      </div>
      <div class="score-value">${score}</div>
    `;
    scoreBars.appendChild(row);
  });
}

function renderClients() {
  const data = roundData();
  clientCards.innerHTML = "";

  participants.forEach((client, index) => {
    const accepted = data.scores[index] >= threshold;
    const card = document.createElement("article");
    card.className = "client-card";
    const attackerMse = index === 3 && showAttackDetails ? `<div class="kv"><span>Val MSE</span><strong>${formatMse(data.valMse[index])}</strong></div>` : "";
    const loss = data.trainLoss[index] == null ? "poisoned" : data.trainLoss[index].toFixed(6);

    card.innerHTML = `
      <div class="client-heading">
        <strong>${client.name}</strong>
        <span class="client-ticker" style="background:${client.color}">${client.ticker}</span>
      </div>
      <span class="badge ${accepted ? "" : "rejected"}">${accepted ? "Accepted" : "Rejected"}</span>
      <div class="kv"><span>Role</span><strong>${client.role}</strong></div>
      <div class="kv"><span>Range</span><strong>${client.range}</strong></div>
      <div class="kv"><span>Split</span><strong>${client.train}/${client.val}/${client.test}</strong></div>
      <div class="kv"><span>Loss</span><strong>${loss}</strong></div>
      ${attackerMse}
      <div class="kv"><span>Wallet</span><strong class="address">${client.address}</strong></div>
    `;
    clientCards.appendChild(card);
  });
}

function renderEvents() {
  const data = roundData();
  const accepted = acceptedIndexes(data);
  const totalScore = accepted.reduce((sum, item) => sum + item.score, 0);
  const rejected = participants.filter((_, index) => data.scores[index] < threshold);
  const weightLine = accepted
    .map((item) => `${participants[item.index].name} ${(item.score / totalScore * 100).toFixed(1)}%`)
    .join(", ");

  const events = [
    ["Round", `Round ${data.round} client updates received`, "local weights only"],
    ["Proof", `${participants.length} validation scores posted to DAO`, "raw data private"],
    ["Filter", `${rejected.map((client) => client.name).join(", ")} rejected below threshold`, `score < ${threshold}`],
    ["FedAvg", `Aggregation weights assigned: ${weightLine}`, "governance weighted"],
    ["Global", `New global model committed with MSE ${formatMse(data.globalMse)}`, "model registry updated"]
  ];

  eventLog.innerHTML = events.map(([tag, main, meta]) => `
    <div class="event-item">
      <div class="event-tag">${tag}</div>
      <div class="event-main">${main}</div>
      <div class="event-meta">${meta}</div>
    </div>
  `).join("");
}

function renderMseChart() {
  const width = 640;
  const height = 260;
  const pad = 34;
  const values = rounds.map((item) => item.globalMse);
  const min = Math.min(...values) - 0.000015;
  const max = Math.max(...values) + 0.000015;

  const points = values.map((value, index) => {
    const x = pad + (index / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
    return { x, y, value, active: index <= currentRound };
  });

  const activePath = points.slice(0, currentRound + 1).map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const fullPath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  mseChart.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="#fbfcfb" rx="8"></rect>
    <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#d8dfdf"></line>
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="#d8dfdf"></line>
    <path d="${fullPath}" fill="none" stroke="#c6d1d4" stroke-width="3" stroke-dasharray="7 7"></path>
    <path d="${activePath}" fill="none" stroke="#2f6f9f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
    ${points.map((point, index) => `
      <g>
        <circle cx="${point.x}" cy="${point.y}" r="${index === currentRound ? 8 : 5}" fill="${index <= currentRound ? "#2f6f9f" : "#c6d1d4"}"></circle>
        <text x="${point.x}" y="${height - 10}" text-anchor="middle" font-size="13" font-weight="800" fill="#657179">R${index + 1}</text>
        ${index === currentRound ? `<text x="${point.x}" y="${point.y - 15}" text-anchor="middle" font-size="13" font-weight="800" fill="#152026">${formatMse(point.value)}</text>` : ""}
      </g>
    `).join("")}
  `;
}

function renderAll() {
  renderSummary();
  renderScoreBars();
  renderClients();
  renderEvents();
  renderMseChart();
}

function setRound(index) {
  currentRound = Math.max(0, Math.min(rounds.length - 1, index));
  renderAll();
}

document.querySelector("#prevRound").addEventListener("click", () => setRound(currentRound - 1));
document.querySelector("#nextRound").addEventListener("click", () => setRound(currentRound + 1));
document.querySelector("#resetDemo").addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  document.querySelector("#playDemo").innerHTML = '<span aria-hidden="true">▶</span> Replay';
  setRound(0);
});
roundSlider.addEventListener("input", (event) => setRound(Number(event.target.value) - 1));

document.querySelector("#toggleAttacker").addEventListener("click", (event) => {
  showAttackDetails = !showAttackDetails;
  event.currentTarget.textContent = showAttackDetails ? "Hide attacker impact" : "Show attacker impact";
  renderClients();
});

document.querySelector("#playDemo").addEventListener("click", (event) => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    event.currentTarget.innerHTML = '<span aria-hidden="true">▶</span> Replay';
    return;
  }

  setRound(0);
  event.currentTarget.innerHTML = '<span aria-hidden="true">Ⅱ</span> Pause';
  timer = setInterval(() => {
    if (currentRound >= rounds.length - 1) {
      clearInterval(timer);
      timer = null;
      event.currentTarget.innerHTML = '<span aria-hidden="true">▶</span> Replay';
      return;
    }
    setRound(currentRound + 1);
  }, 1100);
});

renderAll();
