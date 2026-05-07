import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Shield, Coins } from "lucide-react";

export default function SystemOverview({ round, globalMse, isTraining }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active FL Round</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{round} / 5</div>
          <p className="text-xs text-slate-500">
            {isTraining ? "Training in progress..." : "Training Complete"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Global LSTM MSE</CardTitle>
          <Database className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{globalMse.toFixed(5)}</div>
          <p className="text-xs text-slate-500">Validation loss</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Network Security
          </CardTitle>
          <Shield className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Secure</div>
          <p className="text-xs text-slate-500">1 Threat Filtered</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FDAO Minted</CardTitle>
          <Coins className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isTraining ? "0.00" : "5,000.00"}
          </div>
          <p className="text-xs text-slate-500">Total Treasury Supply</p>
        </CardContent>
      </Card>
    </div>
  );
}
