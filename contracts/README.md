# Cryptid Smart Contracts

This directory contains the Solidity smart contracts used for third-party verification of Cryptid achievements. We do NOT store personal data or the entire points ledger on-chain. We strictly use the Polygon network as an immutable notary for major, approved achievements (like certifications or CTF wins).

## Deployment Instructions

Since this is a single, zero-dependency smart contract, the easiest way to deploy it is via the Remix IDE.

1. Go to [Remix IDE (remix.ethereum.org)](https://remix.ethereum.org/).
2. Create a new file called `AchievementAnchor.sol` and paste the contents of the file from this directory.
3. Compile the contract using the Solidity Compiler tab (ensure compiler version `^0.8.19` is selected).
4. Install MetaMask in your browser and switch to the **Polygon Amoy Testnet**.
5. Go to the "Deploy & Run Transactions" tab in Remix.
6. Change the Environment dropdown to **Injected Provider - MetaMask**.
7. Click **Deploy**. (You will need a small amount of testnet MATIC from an Amoy faucet).
8. Once deployed, copy the Contract Address.

## Environment Variables

After deploying, you need to configure your Cryptid backend and frontend.

### Backend (`server/.env`)
```
# The RPC URL for the Polygon Amoy testnet (e.g. from Alchemy or Infura)
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"

# The private key of the wallet you used to deploy the contract (it is the "owner")
ANCHOR_WALLET_PRIVATE_KEY="your_wallet_private_key"

# The deployed contract address
ANCHOR_CONTRACT_ADDRESS="0xYourContractAddress..."
```

### Frontend (`client/.env`)
```
VITE_POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"
VITE_ANCHOR_CONTRACT_ADDRESS="0xYourContractAddress..."
```
