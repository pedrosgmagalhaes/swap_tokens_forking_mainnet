// scripts/01_v2Swap.js

// Importing the necessary libraries
const ethers = require('ethers');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const erc20Artifact = require("../artifacts/contracts/ERC20.sol/IORA.json");
const wethArtifact = require("../artifacts/contracts/WETH.sol/WETH.json");
const hre = require("hardhat");

// Defining the contract addresses
const CONTRACT_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  PAIR: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
};

async function getSigner() {
  const [signer] = await hre.ethers.getSigners();
  return signer;
}

function getContractInstance(address, artifact, signer) {
  return new ethers.Contract(address, artifact.abi, signer);
}

async function logBalances(provider, signer, contracts) {
  const { usdt, weth } = contracts;
  const ethBalance = await provider.getBalance(signer.address);
  const usdtBalance = await usdt.balanceOf(signer.address);
  const wethBalance = await weth.balanceOf(signer.address);

  console.log('--------------------');
  console.log('ETH Balance:', ethers.formatEther(ethBalance));
  console.log('WETH Balance:', ethers.formatEther(wethBalance));
  console.log('USDT Balance:', ethers.formatUnits(usdtBalance, 6));
  console.log('--------------------');
}

async function executeSwap(provider, signer, contracts, amountIn) {
  const { router, weth } = contracts;
  const nonce = await provider.getTransactionCount(signer.address, 'pending');
  
  // Sending 5 ETH to WETH contract
  await signer.sendTransaction({
      to: CONTRACT_ADDRESSES.WETH,
      value: ethers.parseEther('5'),
      nonce: nonce,
  });
  await logBalances(provider, signer, contracts);

  // Approving the router to spend 1 WETH on behalf of the signer
  const tx1 = await weth.approve(CONTRACT_ADDRESSES.ROUTER, amountIn);
  await tx1.wait();

  // Performing the swap from WETH to USDT
  const tx2 = await router.swapExactTokensForTokens(
      amountIn,
      0,
      [CONTRACT_ADDRESSES.WETH, CONTRACT_ADDRESSES.USDT],
      signer.address,
      Math.floor(Date.now() / 1000) + (60 * 10),
      {
          gasLimit: 1000000,
      }
  );
  await tx2.wait();

  await logBalances(provider, signer, contracts);
}

async function main() {
  const signer = await getSigner();
  const provider = hre.ethers.provider;

  const contracts = {
    router: getContractInstance(CONTRACT_ADDRESSES.ROUTER, routerArtifact, signer),
    usdt: getContractInstance(CONTRACT_ADDRESSES.USDT, erc20Artifact, signer),
    weth: getContractInstance(CONTRACT_ADDRESSES.WETH, wethArtifact, signer),
  };

  const amountIn = ethers.parseEther('1');
  await executeSwap(provider, signer, contracts, amountIn);
}

main()
  .catch((error) => {
      console.error(error);
      process.exitCode = 1;
  });
