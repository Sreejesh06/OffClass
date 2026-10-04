import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CryptidRegistry...");
  
  const uri = "https://cryptid.edu/api/metadata/{id}.json";
  
  const CryptidRegistry = await ethers.getContractFactory("CryptidRegistry");
  const registry = await CryptidRegistry.deploy(uri);
  
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  
  console.log(`CryptidRegistry deployed to: ${address}`);
  
  // Also log the deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Deployed by: ${deployer.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
