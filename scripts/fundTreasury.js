const { ethers } = require("hardhat");

async function main() {
  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployments.json"));
  const treasuryAddress = deploymentInfo.contracts.treasury;

  const [deployer] = await ethers.getSigners();

  console.log(" Sending 1.0 ETH to the DAO Treasury...");

  const tx = await deployer.sendTransaction({
    to: treasuryAddress,
    value: ethers.parseEther("1.0"),
  });
  await tx.wait();

  console.log(" Treasury successfully funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
