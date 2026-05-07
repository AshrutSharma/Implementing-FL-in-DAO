import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function GovernanceArena({ isTraining }: any) {
  if (isTraining) {
    return (
      <Card className="flex h-64 items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Governance unlocks after FL training completes (Round 5).
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Token Distribution (Voting Power)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">Client 1</span>
              <span>1,761.50 FDAO (35.2%)</span>
            </div>
            <Progress value={35.2} className="bg-slate-100" />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">Client 2</span>
              <span>1,643.39 FDAO (32.9%)</span>
            </div>
            <Progress value={32.9} className="bg-slate-100" />
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">Client 3</span>
              <span>1,595.11 FDAO (31.9%)</span>
            </div>
            <Progress value={31.9} className="bg-slate-100" />
          </div>
          <div className="opacity-50">
            <div className="mb-2 flex justify-between text-sm text-red-600">
              <span className="font-medium">Attacker</span>
              <span>0.00 FDAO (0.0%)</span>
            </div>
            <Progress value={0} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active DAO Proposal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-bold">Proposal #1</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              "Increase FL training rounds from 5 to 10 per epoch"
            </p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-600">
                Votes FOR: 5,000.00 FDAO
              </span>
              <span className="text-sm font-medium text-red-600">
                Votes AGAINST: 0.00 FDAO
              </span>
            </div>
            <Progress value={100} className="bg-red-100 [&>div]:bg-green-500" />
          </div>
          <div className="flex justify-between items-center rounded-lg bg-slate-900 p-4 text-white">
            <span>Status:</span>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
              EXECUTED
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
