import json
import os
import random

FRONTEND_RESULTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'results')
os.makedirs(FRONTEND_RESULTS_DIR, exist_ok=True)

def generate_json(filename, rounds_data):
    filepath = os.path.join(FRONTEND_RESULTS_DIR, filename)
    
    payload = {
        "rounds": rounds_data,
        "participants": ["Client 1", "Client 2", "Client 3", "Attacker"],
        "addresses": {
            "Client 1": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "Client 2": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            "Client 3": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            "Attacker": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
        }
    }
    
    with open(filepath, 'w') as f:
        json.dump(payload, f, indent=2)
    print(f"Exported: {filename}")

def simulate_poisoning():
    """Attacker submits noise (Score: 0). Normal convergence."""
    rounds = []
    mses = [0.084, 0.052, 0.031, 0.015, 0.008]
    for i in range(5):
        rounds.append({
            "round": i + 1,
            "participants": ["Client 1", "Client 2", "Client 3", "Attacker"],
            "scores": [random.randint(85, 99), random.randint(85, 99), random.randint(85, 99), 0],
            "global_mse": mses[i]
        })
    generate_json("fl_poisoning_results.json", rounds)

def simulate_freeriding():
    """Attacker submits the global model (Score: ~45). Passes threshold but slows convergence."""
    rounds = []
    mses = [0.084, 0.061, 0.048, 0.035, 0.025] 
    for i in range(5):
        rounds.append({
            "round": i + 1,
            "participants": ["Client 1", "Client 2", "Client 3", "Attacker"],
            "scores": [random.randint(85, 99), random.randint(85, 99), random.randint(85, 99), random.randint(40, 50)],
            "global_mse": mses[i]
        })
    generate_json("fl_freeriding_results.json", rounds)

def simulate_sybil():
    """Attacker clones themselves. Client 2, 3, and Attacker all submit bad data."""
    rounds = []
    mses = [0.084, 0.079, 0.075, 0.071, 0.068] 
    for i in range(5):
        rounds.append({
            "round": i + 1,
            "participants": ["Client 1", "Client 2", "Client 3", "Attacker"],
            "scores": [random.randint(85, 99), 0, 0, 0], 
            "global_mse": mses[i]
        })
    generate_json("fl_sybil_results.json", rounds)

if __name__ == "__main__":
    print("Generating Attack Sandbox Data...\n")
    simulate_poisoning()
    simulate_freeriding()
    simulate_sybil()
    print("\n Ready! Update your useSimulation.ts to import these files.")