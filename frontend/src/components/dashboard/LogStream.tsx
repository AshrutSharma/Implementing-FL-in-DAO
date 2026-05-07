import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LogEntry {
  time: string;
  text: string;
}

export default function LogStream({ logs }: { logs: LogEntry[] }) {
  return (
    <Card className="mt-6">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-sm font-bold">
          DAO Transaction Stream
        </CardTitle>
        <span className="text-xs text-slate-500">
          Validation, rejection, aggregation
        </span>
      </CardHeader>

      <CardContent className="bg-slate-50 rounded-b-lg font-mono text-xs h-40 overflow-y-auto p-4 flex flex-col-reverse gap-2">
        {logs.map((log, i) => (
          <div
            key={i}
            className="py-2 text-slate-700 border-b border-slate-200 last:border-0 flex gap-4"
          >
            <span className="text-slate-400 whitespace-nowrap pt-0.5">
              [{log.time}]
            </span>

            <span className="leading-relaxed">{log.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
