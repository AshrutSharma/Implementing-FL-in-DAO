const { ethers } = require("hardhat");
const { mineBlocks } = require("./helpers");

async function main() {
  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployments.json"));

  const governor = await ethers.getContractAt(
    "DAOGovernor",
    deploymentInfo.contracts.governor,
  );
  const treasury = await ethers.getContractAt(
    "DAOTreasury",
    deploymentInfo.contracts.treasury,
  );

  const [proposer, recipient] = await ethers.getSigners();
  const withdrawAmount = ethers.parseEther("0.1");
  const transferCalldata = treasury.interface.encodeFunctionData("withdraw", [
    recipient.address,
    withdrawAmount,
  ]);

  const targets = [await treasury.getAddress()];
  const values = [0];
  const calldatas = [transferCalldata];

  const descriptionHash = ethers.id(
    "Proposal #1: Withdraw 0.1 ETH from treasury",
  );
  const proposalId =
    "78360695787580577968099906292519262638302498571556285317614202788026803826302";

  let state = await governor.state(proposalId);
  console.log("Current Proposal State:", state);

  if (state === 1n) {
    console.log("\n Fast-forwarding time to end the voting period...");
    await mineBlocks(50500);
    state = await governor.state(proposalId);
    console.log("State after voting period:", state);
  }

  if (state === 4n) {
    console.log("\n Queueing the proposal in the Timelock...");
    const queueTx = await governor.queue(
      targets,
      values,
      calldatas,
      descriptionHash,
    );
    await queueTx.wait();
    console.log(" Proposal queued!");

    console.log(
      "\n Fast-forwarding time to bypass Timelock delay (e.g., 24 hours)...",
    );
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine");

    state = await governor.state(proposalId);
    console.log("State after timelock delay:", state);
  }

  state = await governor.state(proposalId);
  if (state === 5n) {
    console.log("\n Executing the proposal...");
    const executeTx = await governor.execute(
      targets,
      values,
      calldatas,
      descriptionHash,
    );
    await executeTx.wait();
    console.log(" Proposal executed successfully! Funds have been withdrawn.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
