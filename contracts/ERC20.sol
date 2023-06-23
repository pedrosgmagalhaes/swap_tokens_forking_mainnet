// contracts/ERC20.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact contact@ioralabs.com
contract IORA is ERC20, Ownable {
    constructor() ERC20("IORA", "IORA") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}