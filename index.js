import {
    Keypair,
    SorobanRpc,
    TransactionBuilder,
    Asset,
    Operation,
    LiquidityPoolAsset,
    getLiquidityPoolId,
    BASE_FEE,
    Networks
} from '@stellar/stellar-sdk';

import fetch from 'node-fetch';

// Function to fund an account using XLM Friendbot
async function fundAccountWithStellarFriendbot(address) {
    const friendbotUrl = `https://friendbot.stellar.org?addr=${address}`;
  
    try {
        const response = await fetch(friendbotUrl);
        if (response.ok) {
            console.log(`Account ${address} successfully funded.`);
            return true;
        } else {
            throw new Error(`Something went wrong funding account: ${address}.`);
        }
    } catch (error) {
        console.error(`Error funding account ${address}:`, error);
        throw new Error(`Error funding account ${address}: ${error.message}`);
    }
}

// Generate a random key pair for the liquidity pool for signing of transaction
const stellarKeypair = Keypair.random();
const traderKeypair = Keypair.random();

// Send test XLM testnet token to an address
try {
    await fundAccountWithStellarFriendbot(stellarKeypair.publicKey());
} catch (error) {
    console.error(error);
    process.exit(1); // Exit if funding fails
}

// Setup the Stellar testnet server account
const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

// Create a function for my asset
const israelAsset = new Asset('Israel', stellarKeypair.publicKey());

// Define the liquidity pool asset
const tokenPoolAsset = new LiquidityPoolAsset(Asset.native(), israelAsset, 30);

// Function to get the liquidity id
const liquidityPoolId = getLiquidityPoolId("constant_product", tokenPoolAsset);
console.log("Assets", israelAsset);
console.log("Liquidity Pool Assets", tokenPoolAsset);
console.log("Liquidity Pool ID", liquidityPoolId);

// Get the defi account (assuming it's the same as stellarKeypair)
const defiAccount = await server.getAccount(stellarKeypair.publicKey());

// Function to fund a liquidity pool
const tokenPoolDepositTransaction = new TransactionBuilder(defiAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
})
    .addOperation(Operation.changeTrust({
        asset: tokenPoolAsset
    }))
    .addOperation(Operation.liquidityPoolDeposit({
        liquidityPoolId: liquidityPoolId,
        maxAmountA: '2000',
        maxAmountB: '2000',
        minPrice: { n: 1, d: 1 },
        maxPrice: { n: 1, d: 1 }
    }))
    .setTimeout(30)
    .build();
tokenPoolDepositTransaction.sign(stellarKeypair);
try {
    const result = await server.sendTransaction(tokenPoolDepositTransaction);
    console.log("Liquidity Pool Created. Transaction URL:",
        `https://stellar.expert/explorer/testnet/tx/${result.hash}`);
} catch (error) {
    console.error(`Error creating Liquidity Pool: ${error}`);
    throw new Error(`Error creating Liquidity Pool: ${error.message}`);
}

// Function to initiate transaction and create a trader account and perform a swap
console.log("Trader Public Key:", traderKeypair.publicKey());
try {
    await fundAccountWithStellarFriendbot(traderKeypair.publicKey());
} catch (error) {
    console.error(error);
    process.exit(1); // Exit if funding fails
}

const traderAccount = await server.getAccount(traderKeypair.publicKey());
const pathPaymentTransaction = new TransactionBuilder(traderAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
})
    .addOperation(Operation.changeTrust({
        asset: israelAsset,
        source: traderKeypair.publicKey()
    }))
    .addOperation(Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: '500',
        destination: traderKeypair.publicKey(),
        destAsset: israelAsset,
        destAmount: '100',
        source: traderKeypair.publicKey()
    }))
    .setTimeout(40)
    .build();

pathPaymentTransaction.sign(traderKeypair);
try {
    const result = await server.sendTransaction(pathPaymentTransaction);
    console.log("Swap Performed. Transaction URL:",
        `https://stellar.expert/explorer/testnet/tx/${result.hash}`);
} catch (error) {
    console.error(`Error performing swap: ${error}`);
    throw new Error(`Error performing swap: ${error.message}`);
}

// Function to withdraw from the liquidity pool
const lpWithdrawTransaction = new TransactionBuilder(defiAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
})
    .addOperation(Operation.liquidityPoolWithdraw({
        liquidityPoolId: liquidityPoolId,
        amount: '100',
        minAmountA: '0',
        minAmountB: '0'
    }))
    .setTimeout(20)
    .build();
lpWithdrawTransaction.sign(stellarKeypair);
try {
    const result = await server.sendTransaction(lpWithdrawTransaction);
    console.log("Withdrawal Successful. Transaction URL:",
        `https://stellar.expert/explorer/testnet/tx/${result.hash}`);
} catch (error) {
    console.error(`Error withdrawing from Liquidity Pool: ${error}`);
    throw new Error(`Error withdrawing from Liquidity Pool: ${error.message}`);
}



// Function to send a payment from one account to another with retry mechanism incase it failed based on network congestion


async function sendPayment(sourceKeypair, destinationAddress, amount, retries = 3) {
    try {
        const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
        const transaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
            .addOperation(Operation.payment({
                destination: destinationAddress,
                asset: Asset.native(),
                amount: amount
            }))
            .setTimeout(30)
            .build();
        transaction.sign(sourceKeypair);
        
        const result = await server.sendTransaction(transaction);
        if (result.status === 'TRY_AGAIN_LATER' && retries > 0) {
            console.log(`Retrying transaction... Attempts left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            return sendPayment(sourceKeypair, destinationAddress, amount, retries - 1);
        }
        
        console.log(`Payment of ${amount} XLM sent to ${destinationAddress}. Transaction URL: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    } catch (error) {
        console.error(`Error sending payment to ${destinationAddress}:`, error);
        throw new Error(`Error sending payment to ${destinationAddress}: ${error.message}`);
    }
}

// Function to create a new account with retry mechanism incase it failed based on network congestion
async function createAccount(sourceKeypair, newAccountPublicKey, startingBalance, retries = 3) {
    try {
        const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
        const transaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
            .addOperation(Operation.createAccount({
                destination: newAccountPublicKey,
                startingBalance: startingBalance
            }))
            .setTimeout(30)
            .build();
        transaction.sign(sourceKeypair);
        
        const result = await server.sendTransaction(transaction);
        if (result.status === 'TRY_AGAIN_LATER' && retries > 0) {
            console.log(`Retrying transaction... Attempts left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            return createAccount(sourceKeypair, newAccountPublicKey, startingBalance, retries - 1);
        }
        
        console.log(`Account created. Transaction URL: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    } catch (error) {
        console.error(`Error creating account: ${error}`);
        throw new Error(`Error creating account: ${error.message}`);
    }
}

const newAccountKeypair = Keypair.random();
console.log("New Account Public Key:", newAccountKeypair.publicKey());

(async () => {
    try {
        // Create the new account first
        await createAccount(stellarKeypair, newAccountKeypair.publicKey(), '100');
        
        // Then send the payment
        await sendPayment(stellarKeypair, traderKeypair.publicKey(), '10');
    } catch (error) {
        console.error(`Error in transaction sequence: ${error}`);
    }
})();


