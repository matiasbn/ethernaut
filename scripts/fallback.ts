import { ethers } from "hardhat";

async function main() {
  const contractName = "Fallback";

  const signer = await ethers.provider.getSigner();
  const owner = signer.getAddress();

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
