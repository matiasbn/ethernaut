import { expect } from "chai";
import { Attacker, Reentrancy } from "../typechain-types";
import { CONTRACTS_NAMES } from "../constants";
import { formatUnits, parseEther } from "ethers/lib/utils";

const hre = require("hardhat");
const { ethers, deployments, getNamedAccounts } = hre;
const { provider } = ethers;

type Fixture = {
  reentrancyContract: Reentrancy;
  attackerContract: Attacker;
};

const setup = deployments.createFixture(async (): Promise<Fixture> => {
  await deployments.fixture(CONTRACTS_NAMES.REENTRANCY);
  const reentrancyContract = await ethers.getContract(
    CONTRACTS_NAMES.REENTRANCY
  );
  const attackerContract = await ethers.getContract(CONTRACTS_NAMES.ATTACKER);
  return {
    reentrancyContract,
    attackerContract,
  };
});

describe(CONTRACTS_NAMES.REENTRANCY, function () {
  let deployer: any;
  let attacker: any;
  let fixture: Fixture;

  before(async () => {
    ({ deployer, attacker } = await getNamedAccounts());
    fixture = await setup();
  });

  // we deposit an amount on behalf of certain user
  it("should deposit with deployer", async function () {
    const { reentrancyContract } = fixture;
    const depositAmount = parseEther("40");
    await reentrancyContract.deposit({
      value: depositAmount,
      from: deployer,
    });

    let filter = reentrancyContract.filters.LogDeposit(null, deployer);
    const events = await reentrancyContract.queryFilter(filter);

    // sender is the attacker contract, not the signer
    expect(events[0].args.sender).to.be.eql(deployer);
    expect(events[0].args.amount).to.be.eql(depositAmount);
  });

  // we deposit an amount on behalf of the Attacker contract
  it("should deposit from Attacker contract", async function () {
    const { attackerContract, reentrancyContract } = fixture;
    const depositAmount = parseEther("10");
    await attackerContract.deposit({
      value: depositAmount,
    });

    let filter = reentrancyContract.filters.LogDeposit(
      null,
      attackerContract.address
    );
    const events = await reentrancyContract.queryFilter(filter);

    // sender is the attacker contract, not the signer
    expect(events[0].args.sender).to.be.eql(attackerContract.address);
    expect(events[0].args.amount).to.be.eql(depositAmount);
  });

  // Vulnerability exploit
  // 1. we validate that the contract has 50 eth
  // 2. we validate that the Attacker has 10 to withdraw
  // 3. we calculate the amount of loops to call (limit)
  // 4. we perform the attack
  // 5. we validate that the balance of the Reentrancy contract is 0 and Attacker is 50

  it("should withdraw multiple times with reentrancy", async function () {
    const { attackerContract, reentrancyContract } = fixture;
    const reentrancyContractBalance = await provider.getBalance(
      reentrancyContract.address
    );

    expect(formatUnits(reentrancyContractBalance)).to.be.eql("50.0");
    const attackerContractBalance = await reentrancyContract.userBalances(
      attackerContract.address
    );
    expect(formatUnits(attackerContractBalance)).to.be.eql("10.0");
    // amount of times that we can loop on the reentrancy vuln
    const limit =
      Number(formatUnits(reentrancyContractBalance)) /
      Number(formatUnits(attackerContractBalance));
    expect(limit).to.be.eql(5);

    // perform the attack
    await attackerContract.withdraw(limit - 1);
    let filter = attackerContract.filters.LogReceived();
    let events = await attackerContract.queryFilter(filter);
    expect(events.length).to.be.eql(5);
    filter = reentrancyContract.filters.LogWithdraw(
      null,
      attackerContract.address
    );
    events = await reentrancyContract.queryFilter(filter);
    expect(events.length).to.be.eql(5);

    const reentrancyContractBalanceAfter = await provider.getBalance(
      reentrancyContract.address
    );

    const attackerContractBalanceAfter = await provider.getBalance(
      attackerContract.address
    );

    expect(formatUnits(reentrancyContractBalanceAfter)).to.be.eql("0.0");
    expect(formatUnits(attackerContractBalanceAfter)).to.be.eql("50.0");
  });
});
