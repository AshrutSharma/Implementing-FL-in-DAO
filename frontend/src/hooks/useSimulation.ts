import { useState, useEffect, useMemo } from "react";

import standardData from "../results/fl_results.json";
import poisoningData from "../results/fl_poisoning_results.json";
import sybilData from "../results/fl_sybil_results.json";
import freeridingData from "../results/fl_freeriding_results.json";

const mapData = (rawData: any) =>
  rawData.rounds.map((r: any) => ({
    round: r.round,
    mse: r.global_mse,
    c1: r.scores[0],
    c2: r.scores[1],
    c3: r.scores[2],
    attacker: r.scores[3],
  }));

export type AttackType = "none" | "poisoning" | "sybil" | "freeriding";

export function useSimulation() {
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attackType, setAttackType] = useState<AttackType>("none");
  const [logs, setLogs] = useState<{ time: string; text: string }[]>([
    {
      time: new Date().toLocaleTimeString(),
      text: "System initialized. Waiting for threat model selection and execution.",
    },
  ]);

  const activeDataset = useMemo(() => {
    switch (attackType) {
      case "poisoning":
        return mapData(poisoningData);
      case "sybil":
        return mapData(sybilData);
      case "freeriding":
        return mapData(freeridingData);
      default:
        return mapData(standardData);
    }
  }, [attackType]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && round < activeDataset.length) {
      timer = setTimeout(() => {
        const currentData = activeDataset[round];
        const timeNow = new Date().toLocaleTimeString();
        let detailedLog = "";

        // Generate a context-aware narrative based on the active threat model
        switch (attackType) {
          case "poisoning":
            detailedLog = `Round ${
              round + 1
            } validation complete. The Proof-of-Learning filter detected a massive MSE spike from the Attacker node (Score: ${
              currentData.attacker
            }/100). The malicious payload was explicitly REJECTED. The global model aggregated the remaining honest nodes via SoftMax FedAvg.`;
            break;
          case "sybil":
            detailedLog = `Round ${
              round + 1
            } validation complete. Sybil Defense activated! Multiple nodes (Client 2, Client 3, and Attacker) returned suspiciously high-error/identical weights. The Smart Contract slashed their governance power to 0. Only Client 1's update was accepted.`;
            break;
          case "freeriding":
            detailedLog = `Round ${
              round + 1
            } validation complete. Client identified as a Free-Rider. The attacker submitted unmodified global weights to save compute (Score: ${
              currentData.attacker
            }/100). Because it passed the basic threshold, it was accepted, but convergence speed is visibly degraded.`;
            break;
          default:
            detailedLog = `Round ${
              round + 1
            } validation complete. All 4 nodes submitted high-quality local updates. Proof-of-Learning scores ranged from ${Math.min(
              currentData.c1,
              currentData.c2,
              currentData.c3,
            )} to ${Math.max(
              currentData.c1,
              currentData.c2,
              currentData.c3,
            )}. Smart contract minted proportional FDAO tokens to all participants.`;
        }

        setRound((r) => r + 1);
        setLogs((prev) => [{ time: timeNow, text: detailedLog }, ...prev]);
      }, 2000);
    } else if (round >= activeDataset.length) {
      setIsPlaying(false);
    }

    return () => clearTimeout(timer);
  }, [isPlaying, round, activeDataset, attackType]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const reset = () => {
    setRound(0);
    setIsPlaying(false);
    setLogs(["Simulation Reset. Ready to run again."]);
  };

  const jumpToRound = (r: number) => {
    if (r >= 0 && r <= activeDataset.length) setRound(r);
  };

  const handleAttackChange = (type: AttackType) => {
    setAttackType(type);
    setRound(0);
    setIsPlaying(false);
    setLogs([`Threat Model changed to: ${type.toUpperCase()}. Ready to run.`]);
  };

  return {
    round,
    isPlaying,
    logs,
    attackType,
    currentData: round > 0 ? activeDataset[round - 1] : null,
    chartData: activeDataset.slice(0, round),
    togglePlay,
    reset,
    jumpToRound,
    handleAttackChange,
  };
}
