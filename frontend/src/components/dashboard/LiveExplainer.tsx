import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function LiveExplainer({
  round,
  isPlaying,
}: {
  round: number;
  isPlaying: boolean;
}) {
  const getExplanation = () => {
    if (!isPlaying && round === 0)
      return "System Idle. Click 'Run' to begin the Federated Learning loop.";
    if (round === 1)
      return "Round 1: Clients download the initial global model. They train locally on their private stock data to find the optimal weights.";
    if (round >= 2 && round <= 3)
      return `Round ${round}: Proof-of-Learning active. The Smart Contract tests each client's update against a hidden validation set. Honest clients pass.`;
    if (round === 4)
      return "Round 4: Attack Neutralized. The AMZN client submitted poisoned data. The filter detected a massive error spike and rejected it with a 0 score.";
    if (round === 5)
      return "Round 5: Training Complete! Merging final weights via FedAvg. The DAO is now minting FDAO governance tokens proportional to each client's validated contributions.";
    return "Simulation finished. The DAO is now ready for meritocratic voting.";
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <Info className="h-5 w-5 text-blue-600" />
        <CardTitle className="text-sm text-blue-800">
          What is happening right now?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-900 font-medium leading-relaxed transition-all duration-500">
          {getExplanation()}
        </p>
      </CardContent>
    </Card>
  );
}
