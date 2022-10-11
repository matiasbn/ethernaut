import { expect } from "chai";
import { generateKeyPair } from "crypto";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

async function main() {
  const contractName = "Fallback";
  const { provider } = ethers;
  const deployer = await ethers.provider.getSigner();
  const attacker = await ethers.Wallet.createRandom();
  // Fund attacker
  await deployer.sendTransaction({
    value: parseEther("10"),
    to: attacker.address,
  });

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();

  // contribute to contract
  await contract.contribute({
    value: parseEther("0.0009"),
  });
  let contractBalance = 
  // trigger fallback
  // check ownership
  // check balance
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
