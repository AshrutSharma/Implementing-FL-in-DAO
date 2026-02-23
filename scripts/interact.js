const { ethers } = require("hardhat");

async function main() {
  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployments.json"));

  const [voter] = await ethers.getSigners();
  const governor = await ethers.getContractAt(
    "DAOGovernor",
    deploymentInfo.contracts.governor,
  );

  console.log("Interacting with Governor at:", await governor.getAddress());
  console.log("Voter address:", voter.address);

  // Get voting power
  const votingPower = await governor.getVotes(
    voter.address,
    (await ethers.provider.getBlockNumber()) - 1,
  );
  console.log("\nYour voting power:", ethers.formatEther(votingPower), "votes");

  const PROPOSAL_ID =
    "78360695787580577968099906292519262638302498571556285317614202788026803826302";

  console.log("\nProposal ID:", PROPOSAL_ID);
  console.log("Proposal state:", await governor.state(PROPOSAL_ID));

  const voteType = 1;
  console.log("\nCasting vote...");
  const voteTx = await governor.castVote(PROPOSAL_ID, voteType);
  await voteTx.wait();

  console.log(" Vote cast successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
