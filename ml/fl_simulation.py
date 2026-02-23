import torch
import torch.nn as nn
import torch.optim as optim
import copy

class InvestmentPredictor(nn.Module):
    def __init__(self, input_features=5):
        super(InvestmentPredictor, self).__init__()
        self.fc1 = nn.Linear(input_features, 16)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(16, 1)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

def simulate_client_data(num_samples=100, input_features=5):
    """Generates dummy local investment data for a client."""
    X = torch.randn(num_samples, input_features)
    y = X.sum(dim=1, keepdim=True) * 0.5 + torch.randn(num_samples, 1) * 0.1
    return X, y

def local_train(client_id, global_model, epochs=5):
    """Simulates a client training the model locally on their private data."""
    print(f"Client {client_id} is training locally...")
    
    local_model = copy.deepcopy(global_model)
    criterion = nn.MSELoss()
    optimizer = optim.SGD(local_model.parameters(), lr=0.01)
    
    X, y = simulate_client_data()
    
    for epoch in range(epochs):
        optimizer.zero_grad()
        predictions = local_model(X)
        loss = criterion(predictions, y)
        loss.backward()
        optimizer.step()
        
    print(f"✅ Client {client_id} finished training. Final Loss: {loss.item():.4f}")
    
    contribution_score = max(0, 100 - int(loss.item() * 10))
    
    return local_model.state_dict(), contribution_score

def aggregate_models(global_model, client_updates):
    """
    Implements Federated Averaging (FedAvg).
    Takes the weights from all clients and averages them into the global model.
    """
    print("\n⚖️ Aggregating client updates (FedAvg)...")
    global_dict = global_model.state_dict()
    
    for key in global_dict.keys():
        global_dict[key] = torch.stack([client_updates[i][key] for i in range(len(client_updates))], 0).mean(0)
        
    global_model.load_state_dict(global_dict)
    print("🌟 Global model successfully updated!")
    return global_model

def main():
    print("--- Starting F-DAO Off-Chain Federated Learning ---")
    
    global_model = InvestmentPredictor()
    
    num_clients = 3
    client_updates = []
    client_scores = {}
    
    for i in range(1, num_clients + 1):
        updated_weights, score = local_train(client_id=i, global_model=global_model)
        client_updates.append(updated_weights)
        client_scores[i] = score
        
    global_model = aggregate_models(global_model, client_updates)
    
    print("\n📊 Contribution Scores for this round:")
    for client_id, score in client_scores.items():
        print(f"Client {client_id}: {score}/100")

if __name__ == "__main__":
    main()