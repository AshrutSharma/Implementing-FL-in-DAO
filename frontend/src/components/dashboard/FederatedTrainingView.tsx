import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function FederatedTrainingView({ round, isTraining }: any) {
  const clients = [
    { id: "Client 1", data: "Yahoo: AAPL", isAttacker: false },
    { id: "Client 2", data: "Yahoo: MSFT", isAttacker: false },
    { id: "Client 3", data: "Yahoo: GOOGL", isAttacker: false },
    { id: "Attacker", data: "Yahoo: AMZN (Poisoned)", isAttacker: true },
  ];

  const progressVal = isTraining ? (Date.now() % 4000) / 40 : 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {clients.map((c) => (
        <Card
          key={c.id}
          className={c.isAttacker ? "border-red-200 bg-red-50" : ""}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-bold">{c.id}</CardTitle>
            <Badge variant={c.isAttacker ? "destructive" : "default"}>
              {c.isAttacker ? "Malicious Node" : "Honest Node"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Local Data Stream:</span>
                <span className="font-mono font-medium">{c.data}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Epoch Progress:</span>
                <span>{isTraining ? "Training..." : "Idle"}</span>
              </div>
              <Progress
                value={isTraining ? progressVal : 100}
                className={c.isAttacker ? "bg-red-200" : ""}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
