const { ethers } = require("hardhat");

async function main() {
    // Load deployment info
    const fs = require("fs");
    const deploymentInfo = JSON.parse(fs.readFileSync("./deployments.json"));

    console.log("Creating a proposal...");

    // Get contracts
    const governor = await ethers.getContractAt(
        "DAOGovernor",
        deploymentInfo.contracts.governor
    );
    const treasury = await ethers.getContractAt(
        "DAOTreasury",
        deploymentInfo.contracts.treasury
    );

    // Example: Create a proposal to withdraw funds from treasury
    const [proposer, recipient] = await ethers.getSigners();
    const withdrawAmount = ethers.parseEther("0.1");

    console.log("\nProposal Details:");
    console.log("Action: Withdraw from treasury");
    console.log("Amount:", ethers.formatEther(withdrawAmount), "ETH");
    console.log("Recipient:", recipient.address);

    // Encode the function call
    const transferCalldata = treasury.interface.encodeFunctionData("withdraw", [
        recipient.address,
        withdrawAmount,
    ]);

    // Create proposal
    const proposalDescription = "Proposal #1: Withdraw 0.1 ETH from treasury";
    const targets = [await treasury.getAddress()];
    const values = [0];
    const calldatas = [transferCalldata];

    console.log("\nSubmitting proposal...");
    const proposeTx = await governor.propose(
        targets,
        values,
        calldatas,
        proposalDescription
    );
    const proposeReceipt = await proposeTx.wait();

    // Get proposal ID from event
    const proposalId = proposeReceipt.logs[0].args.proposalId;
    console.log("Proposal created with ID:", proposalId.toString());
    console.log("Proposal state:", await governor.state(proposalId));

    console.log("\n Proposal created successfully!");
    console.log("\nNext steps:");
    console.log("1. Wait for voting delay to pass");
    console.log("2. Vote on the proposal");
    console.log("3. Queue the proposal after voting period");
    console.log("4. Execute the proposal after timelock delay");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
