import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import predictionsData from "../../results/predictions.json";

export default function InvestmentUtility({
  isPlaying,
  round,
}: {
  isPlaying: boolean;
  round: number;
}) {
  if (round < 5 || isPlaying) {
    return (
      <Card className="mt-6 border-dashed">
        <CardContent className="h-72 flex flex-col items-center justify-center text-slate-400">
          <p> Complete 5 FL Training Rounds to unlock Model Predictions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold">
              Investment Utility: Global Model Predictions
            </CardTitle>
            <p className="text-xs text-slate-500">
              Actual Market Price vs. F-DAO LSTM Predicted Price (AAPL - 30 Day
              Out-of-Sample)
            </p>
          </div>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">
            Profitable Alpha Generated
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={predictionsData}
            margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => val.split("-").slice(1, 3).join("/")}
            />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0f172a"
              strokeWidth={2}
              name="Actual AAPL Price ($)"
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="F-DAO LSTM Predicted ($)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
