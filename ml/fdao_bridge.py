import torch
import torch.nn as nn
import torch.optim as optim
import copy
from web3 import Web3
import time

class InvestmentPredictor(nn.Module):
    def __init__(self, input_features=5):
        super(InvestmentPredictor, self).__init__()
        self.fc1 = nn.Linear(input_features, 16)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(16, 1)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        return self.fc2(x)

def simulate_client_data(num_samples=100, input_features=5):
    X = torch.randn(num_samples, input_features)
    y = X.sum(dim=1, keepdim=True) * 0.5 + torch.randn(num_samples, 1) * 0.1
    return X, y

def local_train(client_id, global_model, epochs=5):
    print(f" Client {client_id} is training locally...")
    local_model = copy.deepcopy(global_model)
    criterion = nn.MSELoss()
    optimizer = optim.SGD(local_model.parameters(), lr=0.01)
    X, y = simulate_client_data()
    
    for epoch in range(epochs):
        optimizer.zero_grad()
        loss = criterion(local_model(X), y)
        loss.backward()
        optimizer.step()
        
    print(f" Client {client_id} finished. Final Loss: {loss.item():.4f}")
    contribution_score = max(0, 100 - int(loss.item() * 10))
    return local_model.state_dict(), contribution_score

def aggregate_with_filter(global_model, client_updates, client_scores, threshold=50):
    """
    Implements the F-DAO Mitigation Strategy.
    Evaluation of quality happens BEFORE aggregation.
    """
    print("\n  Applying F-DAO Contribution Assessment Filter...")
    valid_updates = []
    
    for i, score in client_scores.items():
        if score >= threshold:
            valid_updates.append(client_updates[i-1])
        else:
            print(f" Rejecting malicious/low-quality update from Client {i} (Score {score})")
    
    if not valid_updates:
        print(" No valid updates. Global model remains unchanged.")
        return global_model

    print(f" Aggregating {len(valid_updates)} verified updates (FedAvg)...")
    global_dict = global_model.state_dict()
    for key in global_dict.keys():
        global_dict[key] = torch.stack([update[key] for update in valid_updates], 0).mean(0)
    
    global_model.load_state_dict(global_dict)
    print(" Global model successfully updated with verified weights!")
    return global_model

def distribute_rewards(client_scores):
    print("\n --- Connecting to Local F-DAO Blockchain ---")
    w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
    
    if not w3.is_connected():
        print(" Could not connect to blockchain. Is your Hardhat node running?")
        return

    print(" Connected to local Hardhat network.")

    TOKEN_ADDRESS = w3.to_checksum_address("0x5FbDB2315678afecb367f032d93F642f64180aa3")
    AGGREGATOR_ACCOUNT = w3.eth.accounts[0]
    
    erc20_abi = [
        {
            "inputs": [
                {"internalType": "address", "name": "to", "type": "address"},
                {"internalType": "uint256", "name": "amount", "type": "uint256"}
            ],
            "name": "transfer",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
    
    token_contract = w3.eth.contract(address=TOKEN_ADDRESS, abi=erc20_abi)

    print("\n Issuing Merit-Based F-DAO Token Rewards:")
    for client_id, score in client_scores.items():
        client_address = w3.eth.accounts[client_id]
        
        tokens_to_award = (score * 10) 
        wei_to_award = tokens_to_award * (10 ** 18)
        
        print(f"  -> Sending {tokens_to_award} F-DAO Tokens to Client {client_id} (Score {score})")
        
        try:
            tx_hash = token_contract.functions.transfer(client_address, wei_to_award).transact({'from': AGGREGATOR_ACCOUNT})
            w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"     Transaction Confirmed!")
        except Exception as e:
            print(f"     Transaction Failed: {e}")

def main():
    print("==================================================")
    print("      F-DAO FEDERATED LEARNING CYCLE STARTED      ")
    print("==================================================\n")
    
    global_model = InvestmentPredictor()
    client_updates = []
    client_scores = {}
    
    for i in range(1, 4):
        weights, score = local_train(i, global_model)
        client_updates.append(weights)
        client_scores[i] = score
        time.sleep(1)
        
    global_model = aggregate_with_filter(global_model, client_updates, client_scores)
    
    distribute_rewards(client_scores)
    
    print("\n==================================================")
    print("      F-DAO ROUND COMPLETE. MODEL UPDATED.        ")
    print("==================================================")

if __name__ == "__main__":
    main()