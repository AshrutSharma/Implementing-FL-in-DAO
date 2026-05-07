import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MiddleSection({ currentData, chartData }: any) {
  const scores = [
    { name: "Client 1", val: currentData?.c1 || 0 },
    { name: "Client 2", val: currentData?.c2 || 0 },
    { name: "Client 3", val: currentData?.c3 || 0 },
    { name: "Attacker", val: 0, isAttacker: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Live Proof Scores Card */}
      <Card>
        <CardHeader className="flex flex-row justify-between pb-2">
          <CardTitle className="text-sm">Live Proof Scores</CardTitle>
          <span className="text-xs text-slate-500">
            Normalized after validation
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          {scores.map((c) => (
            <div key={c.name} className="flex items-center gap-4">
              <span className="w-20 text-sm font-bold">{c.name}</span>
              <Progress
                value={c.val}
                className={`flex-1 ${c.isAttacker ? "bg-red-100" : ""}`}
              />
              <span
                className={`w-8 text-right font-bold ${
                  c.isAttacker ? "text-red-500" : ""
                }`}
              >
                {c.val}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Global Convergence Chart Card */}
      <Card>
        <CardHeader className="flex flex-row justify-between pb-2">
          <CardTitle className="text-sm">Global Convergence</CardTitle>
          <span className="text-xs text-slate-500">MSE per round</span>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="round"
                tickFormatter={(v) => `R${v}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis hide domain={[0, 0.1]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mse"
                stroke="#0f172a"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
