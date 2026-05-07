import { motion } from "framer-motion";
import { CheckCircle, XCircle, Database } from "lucide-react";

export default function ProofOfLearningXRay({ clientData }: any) {

  return (
    <div className="p-4 bg-slate-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Proof-of-Learning Pipeline</h3>

      <div className="flex flex-col space-y-4">
        {clientData.map((client: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-3 shadow-sm rounded-md border"
          >
            <div className="flex flex-col text-sm w-1/4">
              <span className="font-bold">{client.id} Update</span>
              <span className="text-gray-500">
                Local MSE: {client.mse.toFixed(4)}
              </span>
            </div>

            <div className="flex-1 px-4 relative flex items-center">
              <div className="h-1 w-full bg-gray-200 rounded"></div>
              <motion.div
                initial={{ left: 0 }}
                animate={{ left: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-3 h-3 bg-blue-500 rounded-full"
              />
            </div>

            <div className="px-4 py-2 bg-yellow-100 rounded border border-yellow-300 text-center text-sm w-1/4">
              <Database className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
              <span>D_val Check</span>
            </div>

            <div className="w-1/4 flex justify-end items-center space-x-2 pl-4">
              {client.score > 10 ? (
                <>
                  <span className="text-green-600 font-bold">
                    Score: {client.score}
                  </span>
                  <CheckCircle className="text-green-500" />
                </>
              ) : (
                <>
                  <span className="text-red-600 font-bold text-sm">
                    REJECTED (Score: 0)
                  </span>
                  <XCircle className="text-red-500" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
