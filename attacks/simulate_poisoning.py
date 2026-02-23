import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.fdao_bridge import local_train, aggregate_with_filter, distribute_rewards, InvestmentPredictor
from attacks.adversaries import get_poisoned_update

def run_poisoning_simulation():
    print("--- F-DAO Model Poisoning Simulation ---")
    global_model = InvestmentPredictor()
    client_updates = []
    client_scores = {}

    weights, score = local_train(1, global_model)
    client_updates.append(weights)
    client_scores[1] = score

    print(" Client 2 is attempting Model Poisoning...")
    client_updates.append(get_poisoned_update())
    client_scores[2] = 2

    global_model = aggregate_with_filter(global_model, client_updates, client_scores)
    distribute_rewards(client_scores)

if __name__ == "__main__":
    run_poisoning_simulation()