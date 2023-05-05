// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Erc20Usdc is ERC20 {
    constructor() ERC20("Usdc", "USDC") {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
}
