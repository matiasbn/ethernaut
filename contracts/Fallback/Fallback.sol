// SPDX-License-Identifier: MIT

// Look carefully at the contract's code below.
// You will beat this level if
// 1. you claim ownership of the contract
// 2. you reduce its balance to 0

pragma solidity ^0.8.17;

contract Fallback {
    mapping(address => uint) public contributions;
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
        contributions[msg.sender] = 1000 * (1 ether);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    function contribute() public payable {
        require(msg.value < 0.001 ether);
        contributions[msg.sender] += msg.value;
        if (contributions[msg.sender] > contributions[owner]) {
            owner = payable(msg.sender);
        }
    }

    function getContribution() public view returns (uint) {
        return contributions[msg.sender];
    }

    function withdraw() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    receive() external payable {
        require(msg.value > 0 && contributions[msg.sender] > 0);
        owner = payable(msg.sender);
    }
}
