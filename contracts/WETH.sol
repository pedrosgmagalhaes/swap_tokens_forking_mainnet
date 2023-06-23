// contracts/WETH.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact contact@yourdomain.com
contract WETH is ERC20, Ownable{
    constructor() ERC20("Wrapped Ether", "WETH") {}

    function deposit() external payable onlyOwner{
        _mint(msg.sender, msg.value);
    }

    function withdraw(uint amount) external onlyOwner {
        require(balanceOf(msg.sender) >= amount);
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }
}
