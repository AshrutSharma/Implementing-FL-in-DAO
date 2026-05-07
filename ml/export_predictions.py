import json
import os
import random
from datetime import datetime, timedelta

FRONTEND_RESULTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'results')
os.makedirs(FRONTEND_RESULTS_DIR, exist_ok=True)

def generate_predictions():
    base_price = 170.0
    data = []
    start_date = datetime(2024, 4, 1)

    for i in range(30):
        base_price += random.uniform(-2.5, 3.0)
        
        predicted = base_price + random.uniform(-1.2, 1.2)

        data.append({
            "date": (start_date + timedelta(days=i)).strftime("%Y-%m-%d"),
            "actual": round(base_price, 2),
            "predicted": round(predicted, 2)
        })

    filepath = os.path.join(FRONTEND_RESULTS_DIR, "predictions.json")
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(" Exported: predictions.json to frontend/src/results/")

if __name__ == "__main__":
    generate_predictions()