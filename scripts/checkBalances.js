const { ethers } = require("hardhat");

async function main() {
  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployments.json"));

  const tokenAddress =
    deploymentInfo.contracts.governanceToken ||
    deploymentInfo.contracts.token ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log(`Using Token Address: ${tokenAddress}`);

  const token = await ethers.getContractAt("GovernanceToken", tokenAddress);
  const accounts = await ethers.getSigners();

  console.log("\n --- F-DAO GOVERNANCE POWER DASHBOARD ---");
  console.log("----------------------------------------------");

  for (let i = 1; i <= 5; i++) {
    const address = accounts[i].address;
    const balance = await token.balanceOf(address);

    const votes = await token.getVotes(address);

    let label = i <= 2 ? "✅ HONEST" : "🕵️ ATTACKER";

    console.log(`${label} Client ${i} (${address.substring(0, 8)}...):`);
    console.log(`   Tokens Earned: ${ethers.formatUnits(balance, 18)} F-DAO`);
    console.log(`   Voting Power:  ${ethers.formatUnits(votes, 18)} votes`);
    console.log("----------------------------------------------");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
