import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

const contractName = "CoinFlip";

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
    it("consecutiveWins should be 10", async function () {
      const { contract } = await loadFixture(deployFixture);
      const Contract = await ethers.getContractFactory("CoinFlipAttack");
      const coinflipAttack = await Contract.deploy(contract.address);
      for (let index = 0; index < 10; index++) await coinflipAttack.guess();
      expect((await contract.consecutiveWins()).toString()).to.be.eql("10");
    });
  });
});
