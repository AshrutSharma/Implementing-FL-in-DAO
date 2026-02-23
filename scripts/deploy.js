const { ethers } = require("hardhat");

async function main() {
  console.log("Starting DAO deployment...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deployment parameters
  const TOKEN_NAME = "DAO Governance Token";
  const TOKEN_SYMBOL = "DAOG";
  const VOTING_DELAY = 1;
  const VOTING_PERIOD = 50400;
  const PROPOSAL_THRESHOLD = ethers.parseEther("1000");
  const QUORUM_PERCENTAGE = 4;
  const MIN_DELAY = 3600;

  // 1. Deploy Governance Token
  console.log("\n1. Deploying Governance Token...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    deployer.address,
  );
  await governanceToken.waitForDeployment();
  const tokenAddress = await governanceToken.getAddress();
  console.log("Governance Token deployed to:", tokenAddress);

  // Delegate voting power to self
  console.log("Delegating voting power to deployer...");
  const delegateTx = await governanceToken.delegate(deployer.address);
  await delegateTx.wait();
  console.log("Voting power delegated");

  // 2. Deploy Timelock
  console.log("\n2. Deploying Timelock Controller...");
  const TimelockController = await ethers.getContractFactory(
    "TimelockController",
  );
  const timelock = await TimelockController.deploy(
    MIN_DELAY,
    [],
    [],
    deployer.address,
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("Timelock Controller deployed to:", timelockAddress);

  // 3. Deploy Governor
  console.log("\n3. Deploying DAO Governor...");
  const DAOGovernor = await ethers.getContractFactory("DAOGovernor");
  const governor = await DAOGovernor.deploy(
    tokenAddress,
    timelockAddress,
    VOTING_DELAY,
    VOTING_PERIOD,
    PROPOSAL_THRESHOLD,
    QUORUM_PERCENTAGE,
  );
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("DAO Governor deployed to:", governorAddress);

  // 4. Deploy Treasury
  console.log("\n4. Deploying DAO Treasury...");
  const DAOTreasury = await ethers.getContractFactory("DAOTreasury");
  const treasury = await DAOTreasury.deploy(timelockAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("DAO Treasury deployed to:", treasuryAddress);

  // 5. Setup roles
  console.log("\n5. Setting up roles...");
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  const DEFAULT_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();

  // Grant proposer role to governor
  console.log("Granting PROPOSER_ROLE to Governor...");
  let tx = await timelock.grantRole(PROPOSER_ROLE, governorAddress);
  await tx.wait();

  // Grant executor role to governor
  console.log("Granting EXECUTOR_ROLE to Governor...");
  tx = await timelock.grantRole(EXECUTOR_ROLE, governorAddress);
  await tx.wait();

  // Grant canceller role to governor
  console.log("Granting CANCELLER_ROLE to Governor...");
  tx = await timelock.grantRole(CANCELLER_ROLE, governorAddress);
  await tx.wait();

  // Revoke admin role from deployer (optional, for full decentralization)
  // console.log("Revoking admin role from deployer...");
  // tx = await timelock.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address);
  // await tx.wait();

  console.log("\n DAO Deployment Complete!");
  console.log("\n Contract Addresses:");
  console.log("=".repeat(50));
  console.log("Governance Token:", tokenAddress);
  console.log("Timelock Controller:", timelockAddress);
  console.log("DAO Governor:", governorAddress);
  console.log("DAO Treasury:", treasuryAddress);
  console.log("=".repeat(50));

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      governanceToken: tokenAddress,
      timelock: timelockAddress,
      governor: governorAddress,
      treasury: treasuryAddress,
    },
    parameters: {
      tokenName: TOKEN_NAME,
      tokenSymbol: TOKEN_SYMBOL,
      votingDelay: VOTING_DELAY,
      votingPeriod: VOTING_PERIOD,
      proposalThreshold: PROPOSAL_THRESHOLD.toString(),
      quorumPercentage: QUORUM_PERCENTAGE,
      minDelay: MIN_DELAY,
    },
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2),
  );
  console.log("\n Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
