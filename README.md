# Federated DAO (F-DAO) - Implementation Framework

This repository contains the full technical implementation of the **Federated DAO (F-DAO)** framework. It integrates **On-Chain Governance** with **Off-Chain Federated Learning** to create a meritocratic investment forecasting system.

## Key Innovations

### 1. Merit-Based Voting Power

Unlike traditional DAOs where power is bought (Proof-of-Stake), F-DAO power is **earned**. The system uses a Python-based bridge to evaluate the quality of local AI model updates and mints governance tokens proportionally to the participant's contribution score.

### 2. Federated Learning Loop (PyTorch)

The project simulates a multi-client environment where participants train a global **Investment Predictor** model on private datasets using the FedAvg (Federated Averaging) algorithm.

### 3. Adversarial Resilience

Dedicated modules to simulate and mitigate common threats to FL-based systems:

* **Sybil Attacks:** Defense against one attacker using multiple identities.
* **Model Poisoning:** Filtering of malicious/random weights.
* **Free-Riding:** Identification and penalization of participants who don't contribute training effort.
* **Label Flipping:** Detection of subtle data manipulation.

---

## Project Structure

```
Implementing-FL-in-DAO/
├── contracts/          # On-Chain Layer (Solidity)
│   ├── GovernanceToken.sol   # Meritocratic ERC20Votes
│   ├── DAOGovernor.sol       # FL Parameter & Treasury Control
│   └── DAOTreasury.sol       # Fund Management
├── ml/                 # Off-Chain Layer (PyTorch)
│   ├── fl_simulation.py      # Core FL training loop
│   ├── fdao_bridge.py        # Web3 bridge for merit rewards
│   └── generate_plots.py     # Result visualization script
├── attacks/            # Security Analysis (Threat Models)
│   ├── adversaries.py        # Malicious participant logic
│   ├── simulate_sybil.py     # Sybil defense test
│   ├── simulate_poisoning.py # Poisoning defense test
│   └── simulate_freeriding.py# Laziness/Free-rider test
└── scripts/            # Management & Auditing
    ├── checkBalances.js      # Governance Power Dashboard
    └── delegate.js           # Voting power activation

```

---

## Execution Guide

### 1. Initialize Blockchain

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

```

### 2. Run Federated Training Round

This script trains the model, calculates scores, and triggers the blockchain to reward clients.

```bash
python ml/fdao_bridge.py

```

### 3. Activate Earned Governance

```bash
npx hardhat run scripts/delegate.js --network localhost

```

### 4. Audit the Power Gap

Verify that honest participants have out-earned the attackers.

```bash
npx hardhat run scripts/checkBalances.js --network localhost

```

---

## Experimental Results

| Client Role | Status | Tokens Earned | Influence |
| --- | --- | --- | --- |
| **Honest Client 1** | Active | ~7,940 | **High** |
| **Honest Client 2** | Active | ~7,030 | **High** |
| **Sybil Identity** | **Rejected** | ~200 | Low |
| **Model Poisoner** | **Filtered** | ~200 | Low |

## Tech Stack

* **Blockchain:** Solidity, Hardhat, Ethers.js, OpenZeppelin.
* **AI/ML:** PyTorch, NumPy, Matplotlib.
* **Bridge:** Web3.py.


## License

MIT
