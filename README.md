# Stellar Defi Challenge
## Overview
This project demonstrates how to interact with the Stellar blockchain using the Stellar SDK. It covers funding accounts, creating liquidity pools, performing asset swaps, withdrawing from liquidity pools, sending payments, and creating new accounts on the Stellar testnet.

## Features
Account Funding: Fund Stellar accounts using the Stellar Friendbot on the testnet.
Liquidity Pools: Create and manage liquidity pools.
Asset Swaps: Perform asset swaps using path payments.
Withdrawals: Withdraw from liquidity pools.
Payments: Send payments between accounts with a retry mechanism.
Account Creation: Create new accounts with a retry mechanism.
#### Requirements
Node.js
@stellar/stellar-sdk library
node-fetch library
Installation
Install the required dependencies using npm:


npm install @stellar/stellar-sdk node-fetch
### Functions
1. Fund Account
Uses the Stellar Friendbot to fund a Stellar account with XLM on the testnet.

2. Generate Key Pairs
Generates key pairs for accounts used in transactions.

3. Setup Stellar Testnet Server
Configures the Stellar testnet server to interact with the blockchain.

4. Create Asset and Liquidity Pool
Defines a new asset and creates a liquidity pool with specified parameters.

5. Fund Liquidity Pool
Deposits assets into the liquidity pool to provide liquidity.

6. Perform Asset Swap
Executes a swap of assets using a path payment operation.

7. Withdraw from Liquidity Pool
Withdraws assets from the liquidity pool.

8. Send Payment
Sends payments between accounts with a retry mechanism in case of network congestion.

9. Create Account
Creates new Stellar accounts with a retry mechanism in case of network congestion.

### Error Handling
The script includes error handling for common issues such as:
Funding account failures
Transaction errors
Network congestion issues
### Transaction URLs

Funded Account = GBQ5MG4IXIVZTQGAMNMQACGZJPEKFWVQV4X35IILWPHHRQYYJQPWCL5Y

Liquidity Pool Url = https://stellar.expert/explorer/testnet/tx/0b29880e5c545ca03a077db92d7f89b16d67c380ffbd86ff90d91dbc4b0e09a4

Withdrawal Url = https://stellar.expert/explorer/testnet/tx/669771245e266dca35e0d3330e74e964dfc47c4761f157079dac119e82a4907e

Account Created Url = https://stellar.expert/explorer/testnet/tx/c64bf37dcfff6728c99a4f55b26bada02186f909c790ef399dc5177aaaeb2ab5

Payment Url = https://stellar.expert/explorer/testnet/tx/2c23c79efb3097c496d162211e779320cc384cc8aed84086f6994807a6b6f6d3

Successful transactions are logged with their respective URLs for tracking on the Stellar testnet explorer.

### Usage
Refer to the code comments for usage details and to adapt the script for your specific needs.
