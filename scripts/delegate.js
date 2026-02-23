const { ethers } = require("hardhat");

async function main() {
  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployments.json"));
  const tokenAddress =
    deploymentInfo.contracts.governanceToken || deploymentInfo.contracts.token;
  const token = await ethers.getContractAt("GovernanceToken", tokenAddress);
  const accounts = await ethers.getSigners();

  console.log("📢 Activating Voting Power for all clients...");

  for (let i = 1; i <= 5; i++) {
    console.log(
      `Delegating for Client ${i} (${accounts[i].address.substring(0, 8)}...)`,
    );
    const tx = await token.connect(accounts[i]).delegate(accounts[i].address);
    await tx.wait();
  }

  console.log(" All clients have activated their voting power!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
