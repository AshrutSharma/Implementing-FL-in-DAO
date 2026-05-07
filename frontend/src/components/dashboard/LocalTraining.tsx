import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CLIENT_CONFIG = [
  { id: "Client 1", tag: "AAPL", color: "bg-blue-500" },
  { id: "Client 2", tag: "MSFT", color: "bg-emerald-500" },
  { id: "Client 3", tag: "GOOGL", color: "bg-amber-500" },
  { id: "Attacker", tag: "AMZN", color: "bg-red-500", isAttacker: true },
];

export default function LocalTraining({ round, currentData }: any) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {CLIENT_CONFIG.map((client) => (
        <Card
          key={client.id}
          className={client.isAttacker ? "border-red-200" : ""}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{client.id}</CardTitle>
            <Badge
              className={`${client.color} text-white hover:${client.color}`}
            >
              {client.tag}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <p className="text-slate-500 text-xs">Epoch</p>
                <p className="font-bold">{round > 0 ? "4/4" : "0/4"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Val MSE</p>
                <p className="font-bold">
                  {round > 0 ? currentData?.mse.toFixed(4) : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
