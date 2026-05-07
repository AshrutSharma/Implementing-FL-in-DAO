import { Card, CardContent } from "@/components/ui/card";

export default function MetricsGrid({ round, currentData }: any) {
  const metrics = [
    {
      title: "Global validation MSE",
      value: currentData ? currentData.mse.toFixed(5) : "--",
      sub: round === 0 ? "waiting" : `after Round ${round}`,
    },
    {
      title: "Accepted updates",
      value: `${round === 0 ? "0" : "3"} / 4`,
      sub: "after DAO validation",
    },
    {
      title: "Top governance weight",
      value: currentData
        ? `${Math.max(currentData.c1, currentData.c2, currentData.c3)}/100`
        : "--",
      sub: "waiting for scores",
    },
    {
      title: "Rejected update",
      value: round === 0 ? "--" : "Attacker",
      sub: "poisoned update filter",
      isAlert: true,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <Card key={i} className={m.isAlert ? "border-red-200" : ""}>
          <CardContent className="pt-6">
            <p
              className={`text-sm font-bold ${
                m.isAlert ? "text-red-500" : "text-slate-500"
              }`}
            >
              {m.title}
            </p>
            <h3
              className={`text-2xl font-bold my-1 ${
                m.isAlert ? "text-red-600" : ""
              }`}
            >
              {m.value}
            </h3>
            <p className="text-xs text-slate-500">{m.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
