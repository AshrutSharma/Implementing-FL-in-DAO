import matplotlib.pyplot as plt

clients = ['Honest 1', 'Honest 2', 'Attacker 3', 'Attacker 4', 'Attacker 5']
tokens = [7940, 7030, 3690, 200, 200]
colors = ['#4CAF50', '#4CAF50', '#f44336', '#f44336', '#f44336'] # Green for honest, Red for attacker

plt.figure(figsize=(10, 6))
bars = plt.bar(clients, tokens, color=colors)
plt.title('F-DAO Voting Power Distribution per Participant', fontsize=14)
plt.ylabel('Voting Power (F-DAO Tokens)', fontsize=12)
plt.xlabel('Participant Identity', fontsize=12)
plt.grid(axis='y', linestyle='--', alpha=0.7)

for bar in bars:
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2, yval + 100, f'{int(yval)}', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('results/voting_power_bar_chart.png')

honest_total = sum(tokens[:2])
attacker_total = sum(tokens[2:])
labels_pie = ['Honest Majority', 'Adversarial Group']
sizes = [honest_total, attacker_total]
colors_pie = ['#4CAF50', '#f44336']
explode = (0.1, 0)

plt.figure(figsize=(8, 8))
plt.pie(sizes, explode=explode, labels=labels_pie, autopct='%1.1f%%',
        shadow=True, startangle=140, colors=colors_pie, textprops={'fontsize': 14})
plt.title('Governance Influence: Honest vs. Adversarial Control', fontsize=16)
plt.tight_layout()
plt.savefig('results/influence_pie_chart.png')

print("Visualizations saved: voting_power_bar_chart.png and influence_pie_chart.png")