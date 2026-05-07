import { useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "c1",
    position: { x: 50, y: 50 },
    data: { label: "AAPL" },
    style: { border: "2px solid green" },
  },
  {
    id: "c2",
    position: { x: 50, y: 150 },
    data: { label: "MSFT" },
    style: { border: "2px solid green" },
  },
  {
    id: "c3",
    position: { x: 50, y: 250 },
    data: { label: "GOOGL" },
    style: { border: "2px solid green" },
  },
  {
    id: "attacker",
    position: { x: 50, y: 350 },
    data: { label: "AMZN Attacker" },
    style: { border: "2px solid red" },
  },
  {
    id: "aggregator",
    position: { x: 300, y: 150 },
    data: { label: "FL Aggregator & Evaluator" },
    style: { background: "#fef3c7" },
  },
  {
    id: "blockchain",
    position: { x: 600, y: 150 },
    data: { label: "Hardhat Blockchain (F-DAO)" },
    style: { background: "#e0e7ff" },
  },
];

const initialEdges: Edge[] = [
  { id: "e-c1", source: "c1", target: "aggregator", animated: false },
  { id: "e-c2", source: "c2", target: "aggregator", animated: false },
  { id: "e-c3", source: "c3", target: "aggregator", animated: false },
  { id: "e-att", source: "attacker", target: "aggregator", animated: false },
  { id: "e-agg", source: "aggregator", target: "blockchain", animated: false },
];

export default function NetworkTopologyMap({ currentRoundData }: any) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  useEffect(() => {
    if (currentRoundData?.status === "training") {
      setEdges((eds) => eds.map((e) => ({ ...e, animated: true })));
    } else if (currentRoundData?.status === "evaluation") {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === "e-att")
            return {
              ...e,
              animated: false,
              style: { stroke: "red", strokeWidth: 2 },
            };
          return { ...e, animated: true, style: { stroke: "green" } };
        }),
      );
    }
  }, [currentRoundData]);

  return (
    <div className="h-[400px] w-full border rounded-lg shadow-sm bg-white">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
