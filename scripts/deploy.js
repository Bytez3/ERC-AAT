const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ERC-AAT contract...");

  // Get the contract factory
  const ERC_AAT = await ethers.getContractFactory("ERC_AAT");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const ercAAT = await ERC_AAT.deploy(deployer.address);
  await ercAAT.waitForDeployment();

  const contractAddress = await ercAAT.getAddress();
  console.log("ERC-AAT deployed to:", contractAddress);

  // Verify deployment
  console.log("Verifying deployment...");
  const owner = await ercAAT.owner();
  console.log("Contract owner:", owner);
  console.log("Expected owner:", deployer.address);
  
  if (owner === deployer.address) {
    console.log("✅ Deployment verified successfully!");
  } else {
    console.log("❌ Deployment verification failed!");
  }

  // Set up some example achievements
  console.log("Setting up example achievements...");
  
  const exampleAchievements = [
    {
      id: 1,
      uri: "ipfs://QmExample1/achievement1.json"
    },
    {
      id: 2,
      uri: "ipfs://QmExample2/achievement2.json"
    },
    {
      id: 3,
      uri: "ipfs://QmExample3/achievement3.json"
    }
  ];

  for (const achievement of exampleAchievements) {
    const tx = await ercAAT.setAchievementURI(achievement.id, achievement.uri);
    await tx.wait();
    console.log(`Achievement ${achievement.id} URI set to: ${achievement.uri}`);
  }

  console.log("🎉 ERC-AAT deployment completed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("Owner address:", owner);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    owner: owner,
    network: (await ethers.provider.getNetwork()).name,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };

  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 