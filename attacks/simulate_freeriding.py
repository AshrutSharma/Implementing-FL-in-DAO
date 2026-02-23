import sys
import os
import torch
import torch.nn as nn

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.fdao_bridge import local_train, aggregate_with_filter, distribute_rewards, InvestmentPredictor
from attacks.adversaries import get_freerider_update

def run_freeriding_simulation():
    print("==================================================")
    print("      F-DAO FREE-RIDING ATTACK SIMULATION         ")
    print("==================================================\n")
    
    global_model = InvestmentPredictor()
    client_updates = []
    client_scores = {}

    weights_h, score_h = local_train(1, global_model)
    client_updates.append(weights_h)
    client_scores[1] = score_h

    weights_f = get_freerider_update(global_model)
    client_updates.append(weights_f)
    
    print(" Aggregator verifying Client 2...")
    client_scores[2] = 10
    
    global_model = aggregate_with_filter(global_model, client_updates, client_scores)
    distribute_rewards(client_scores)

if __name__ == "__main__":
    run_freeriding_simulation()