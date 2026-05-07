import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function VerificationDashboard({ round }: any) {
  const scores = [
    { id: "Client 1", score: Math.min(99, 80 + round * 4), alpha: "35.2%" },
    { id: "Client 2", score: Math.min(95, 75 + round * 5), alpha: "32.9%" },
    { id: "Client 3", score: Math.min(97, 78 + round * 4), alpha: "31.9%" },
    { id: "Attacker", score: 0, alpha: "0.0%" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof of Learning Scores (Round {round})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Raw Quality Score (0-100)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">SoftMax Weight (α)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.id}</TableCell>
                <TableCell className="font-mono">{s.score} / 100</TableCell>
                <TableCell>
                  {s.score > 10 ? (
                    <Badge className="bg-green-500">Verified</Badge>
                  ) : (
                    <Badge variant="destructive">Rejected (Poisoned)</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {s.alpha}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
