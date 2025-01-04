require("dotenv").config(); // Load environment variables
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment script...");

  // Replace this value with the fee you want for the Poppad contract
  const deploymentFee = hre.ethers.parseEther("0.1"); // Example: 0.1 ETH

  console.log("Using deployment fee:", deploymentFee.toString());

  // Get the contract factory for Poppad
  const Poppad = await hre.ethers.getContractFactory("Poppad");

  console.log("Deploying Poppad contract...");

  // Deploy the contract with the required constructor argument
  const poppad = await Poppad.deploy(deploymentFee);

  console.log("Awaiting contract deployment confirmation...");
  await poppad.waitForDeployment();

  // Get the deployed contract's address
  const address = await poppad.getAddress();

  console.log("Poppad contract deployed successfully!");
  console.log("Contract Address:", address);

  console.log("Saving deployment details to file...");

  // Save deployment details to a JSON file (Optional)
  const fs = require("fs");
  const deploymentDetails = {
    network: "edu-chain-testnet",
    chainId: 656476,
    contractAddress: address,
    deploymentFee: deploymentFee.toString(),
  };

  fs.writeFileSync(
    "./deploymentDetails.json",
    JSON.stringify(deploymentDetails, null, 2)
  );

  console.log("Deployment details saved successfully!");
}

// Execute the main function and handle any errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
