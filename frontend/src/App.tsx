import { useSimulation } from "./hooks/useSimulation";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MetricsGrid from "./components/dashboard/MetricsGrid";
import LocalTraining from "./components/dashboard/LocalTraining";
import MiddleSection from "./components/dashboard/MiddleSection";
import LogStream from "./components/dashboard/LogStream";
import LiveExplainer from "./components/dashboard/LiveExplainer";
import InvestmentUtility from "./components/dashboard/InvestmentUtility";
import NetworkTopologyMap from "./components/dashboard/NetworkTopologyMap";
import ProofOfLearningXRay from "./components/dashboard/ProofOfLearningXRay";

export default function App() {
  const sim = useSimulation();

  const clientNameMap: Record<string, string> = {
    c1: "AAPL",
    c2: "MSFT",
    c3: "GOOGL",
    attacker: "AMZN Attacker",
  };

  const xrayClients = sim.currentData
    ? Object.entries(sim.currentData)
        .filter(([key]) => key !== "round" && key !== "mse")
        .map(([key, value]) => {
          const formattedId = clientNameMap[key] || key;

          return {
            id: formattedId,
            score: value as number,
            mse: sim.currentData.mse,
          };
        })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header onReset={sim.reset} />

      <div className="flex flex-1 overflow-hidden p-6 gap-6 max-w-[1600px] mx-auto w-full">
        <Sidebar
          round={sim.round}
          isPlaying={sim.isPlaying}
          togglePlay={sim.togglePlay}
          jumpToRound={sim.jumpToRound}
          attackType={sim.attackType}
          onAttackChange={sim.handleAttackChange}
        />

        <main className="flex-1 flex flex-col gap-6 overflow-y-auto pb-6 pr-2">
          <LiveExplainer round={sim.round} isPlaying={sim.isPlaying} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <NetworkTopologyMap currentRoundData={sim.currentData} />
            <ProofOfLearningXRay clientData={xrayClients} />
          </div>

          <MetricsGrid round={sim.round} currentData={sim.currentData} />

          <MiddleSection
            round={sim.round}
            currentData={sim.currentData}
            chartData={sim.chartData}
          />

          <LocalTraining round={sim.round} currentData={sim.currentData} />

          <InvestmentUtility round={sim.round} isPlaying={sim.isPlaying} />

          <LogStream logs={sim.logs} />
        </main>
      </div>
    </div>
  );
}
