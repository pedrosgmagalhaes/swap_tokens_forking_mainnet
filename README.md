# Swap Tokens Forking Mainnet

"swap_tokens_forking_mainnet" is a Node.js application that performs token swaps on Ethereum's mainnet by forking it through the Hardhat Network. The application uses the Uniswap protocol to swap Ethereum wrapped Ether (WETH) for Tether (USDT).

## Getting Started

These instructions will guide you on how to run this project locally.

### Tutorial
- [YouTube](https://www.youtube.com/watch?v=Rys9bTlIVpQ)

### Prerequisites

- Node.js v14.17 or later
- Yarn v1.22 or later

You'll also need to have the following environment variable:

```bash
- INFURA_MAINNET_ENDPOINT: Your Infura mainnet URL
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ioralabs/swap_tokens_forking_mainnet.git
```

2. Change the working directory to swap_tokens_forking_mainnet:

```bash
cd swap_tokens_forking_mainnet
```

3. Install the project dependencies:
```bash
yarn install
```

4. Running the Project
To execute the token swap, use the following command:

```bash
yarn hardhat run scripts/01_v2Swap.js
```

### Acknowledgments
- This project is licensed under the ISC License - see the LICENSE.md file for details.

## Author

### Pedro Magalhães
- [LinkedIn](https://www.linkedin.com/in/pemagalhaes/)
- [GitHub](https://github.com/pedrosgmagalhaes)
- [Website](https://ioralabs.com)
