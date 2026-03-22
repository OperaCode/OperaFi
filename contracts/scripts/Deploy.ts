import { ethers, run, network } from "hardhat";

async function main() {
  console.log("=".repeat(50));
  console.log("  OperaFi Deployment Script");
  console.log("=".repeat(50));

  const [deployer] = await ethers.getSigners();

  console.log(`🌐 Network:       ${network.name}`);
  console.log(`🚀 Deployer:      ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance:       ${ethers.formatEther(balance)} ETH`);

  console.log("\n⏳ Deploying OperaFi...");
  const OperaFi = await ethers.getContractFactory("OperaFi");

  const token = await OperaFi.deploy(deployer.address); // ensure constructor matches

  await token.waitForDeployment();

  const contractAddress = await token.getAddress();

  console.log(`\n✅ OperaFi deployed!`);
  console.log(`📄 Contract Address: ${contractAddress}`);

  // Verification
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting for confirmations...");

    const deployTx = token.deploymentTransaction();

    if (deployTx) {
      await deployTx.wait(5);
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }

    console.log("🔍 Verifying on Etherscan...");

    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
      });
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️ Contract already verified.");
      } else {
        console.error("❌ Verification failed:", error.message);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
