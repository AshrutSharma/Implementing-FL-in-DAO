import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.fdao_bridge import local_train, aggregate_with_filter, distribute_rewards, InvestmentPredictor
from attacks.adversaries import get_poisoned_update
import torch

def run_sybil_simulation():
    print("--- F-DAO Sybil Attack Simulation ---")
    global_model = InvestmentPredictor()
    client_updates = []
    client_scores = {}

    for i in range(1, 3):
        weights, score = local_train(i, global_model)
        client_updates.append(weights)
        client_scores[i] = score

    for i in range(3, 6):
        print(f" Sybil {i} submitting malicious update...")
        client_updates.append(get_poisoned_update())
        client_scores[i] = 5

    global_model = aggregate_with_filter(global_model, client_updates, client_scores)
    distribute_rewards(client_scores)

if __name__ == "__main__":
    run_sybil_simulation()