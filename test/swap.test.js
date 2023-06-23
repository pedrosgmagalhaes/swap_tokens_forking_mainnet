// test/swap.test.js

const { ethers } = require('hardhat');
const { assert } = require('chai');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const erc20Artifact = require("../artifacts/contracts/ERC20.sol/IORA.json");
const wethArtifact = require("../artifacts/contracts/WETH.sol/WETH.json");
const hre = require("hardhat");
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

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
  return new hre.ethers.Contract(address, artifact.abi, signer);
}

async function executeSwap(provider, signer, contracts, amountIn) {
  const { router, weth } = contracts;

  const tx1 = await weth.approve(CONTRACT_ADDRESSES.ROUTER, amountIn);
  await tx1.wait();

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
}

describe('Uniswap V2 Swap', function() {
  let signer;
  let provider;
  let contracts;

  before(async function() {
    signer= await getSigner();
    provider = hre.ethers.provider;
    
    contracts = {
      router: getContractInstance(CONTRACT_ADDRESSES.ROUTER, routerArtifact, signer),
      usdt: getContractInstance(CONTRACT_ADDRESSES.USDT, erc20Artifact, signer),
      weth: getContractInstance(CONTRACT_ADDRESSES.WETH, wethArtifact, signer),
    };

    // Send transaction to wrap 5 Ether into WETH
    const tx = await contracts.weth.deposit({ value: ethers.parseEther('5') });
    await tx.wait();

    const wethBalance = await contracts.weth.balanceOf(signer.address);
    assert.equal(hre.ethers.formatEther(wethBalance), '5.0', 'Initial WETH balance should be 5.0');
  });

  it('Should perform a successful swap', async function() {
    const amountIn = hre.ethers.parseEther('1');
    await executeSwap(provider, signer, contracts, amountIn);

    const wethBalance = await contracts.weth.balanceOf(signer.address);
    const usdtBalance = await contracts.usdt.balanceOf(signer.address);

    assert.isAbove(parseFloat(hre.ethers.formatEther(wethBalance)), 3.9, 'WETH balance should have decreased');
    assert.isAbove(parseFloat(hre.ethers.formatUnits(usdtBalance, 6)), 0, 'USDT balance should have increased');
  });

  it('Should fail when trying to swap without approval', async function() {
    const amountIn = hre.ethers.parseEther('1');

    await assert.isRejected(
      contracts.router.swapExactTokensForTokens(
        amountIn,
        0,
        [CONTRACT_ADDRESSES.WETH, CONTRACT_ADDRESSES.USDT],
        signer.address,
        Math.floor(Date.now() / 1000) + (60 * 10),
        {
          gasLimit: 1000000,
        }
      ),
      'revert',
      'Swap should fail without approval'
    );

  });

  it('Should fail when trying to swap more than the balance', async function() {
    const amountIn = hre.ethers.parseEther('6'); // Greater than the initial balance of 5

    const tx1 = await contracts.weth.approve(CONTRACT_ADDRESSES.ROUTER, amountIn);
    await tx1.wait();

    await assert.isRejected(
      contracts.router.swapExactTokensForTokens(
        amountIn,
        0,
        [CONTRACT_ADDRESSES.WETH, CONTRACT_ADDRESSES.USDT],
        signer.address,
        Math.floor(Date.now() / 1000) + (60 * 10),
        {
          gasLimit: 1000000,
        }
      ),
      'revert',
      'Swap should fail when trying to swap more than the balance'
    );

  });

  it('Should fail if the deadline has passed', async function() {
    const amountIn = hre.ethers.parseEther('1');
  
    const tx1 = await contracts.weth.approve(CONTRACT_ADDRESSES.ROUTER, amountIn);
    await tx1.wait();
  
    try {
      await contracts.router.swapExactTokensForTokens(
        amountIn,
        0,
        [CONTRACT_ADDRESSES.WETH, CONTRACT_ADDRESSES.USDT],
        signer.address,
        Math.floor(Date.now() / 1000) - 60, // Setting the deadline to 1 minute in the past
        {
          gasLimit: 1000000,
        }
      );
    } catch (error) {
      console.log(error);
      assert.fail('Swap should fail if the deadline has passed');
    }
  });

  it('Should fail when trying to swap 0 tokens', async function() {
    const amountIn = hre.ethers.parseEther('0'); // Trying to swap 0 WETH

    // First, approve the router to transfer WETH
    const tx1 = await contracts.weth.approve(CONTRACT_ADDRESSES.ROUTER, amountIn);
    await tx1.wait();

    await assert.isRejected(
      contracts.router.swapExactTokensForTokens(
        amountIn,
        0,
        [CONTRACT_ADDRESSES.WETH, CONTRACT_ADDRESSES.USDT],
        signer.address,
        Math.floor(Date.now() / 1000) + 60,
        {
          gasLimit: 1000000,
        }
      ),
      'revert', // This might need to be changed depending on the exact revert message.
      'Swap should fail when trying to swap 0 tokens'
    );
  });

});
