# F-DAO Frontend Demo

This is a static demonstration dashboard for the Federated Learning in DAO project.

Open `index.html` in a browser to run it. Click `Run` to execute a deterministic in-browser federated learning simulation that mirrors the Colab LSTM workflow for demonstration:

- 5 federated learning rounds
- 3 honest stock-prediction clients and 1 poisoned AMZN attacker
- local private training epochs visible per client
- proof-of-learning scores posted to a DAO-like validation layer
- threshold-based attacker rejection
- governance-weighted FedAvg and global MSE tracking

To try a different dataset, upload a CSV with at least two mostly numeric columns, choose the target column, and click `Use dataset`. The app standardizes numeric features, partitions rows across three honest clients plus one attacker, then runs the same DAO filtering simulation.

Upload-ready example files are available in `sample-data/`:

- `stock_returns_demo.csv`: stock-style returns, volume, volatility, and next return target
- `energy_load_demo.csv`: weather and time inputs for a power demand target
- `student_scores_demo.csv`: academic behavior inputs for a final score target

No build step or npm install is required.

The first static replay version was backed up in `backup-v1`.
