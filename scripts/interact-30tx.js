#!/usr/bin/env node

/**
 * NFT Interaction Script
 * Generates 30 mint transactions for the CryptoPunks collection
 */

const {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    principalCV,
    PostConditionMode
} = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const NETWORK = new StacksMainnet();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEPLOYER = 'SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P';
const CONTRACT_NAME = 'cryptopunks';

// Helper to wait between transactions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getNextNonce(address) {
    const response = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${address}?proof=0`);
    const data = await response.json();
    return BigInt(data.nonce);
}

async function executeTransaction(nonce, description) {
    console.log(`\n[Tx ${nonce}] ${description}`);

    try {
        const txOptions = {
            contractAddress: DEPLOYER,
            contractName: CONTRACT_NAME,
            functionName: 'mint',
            functionArgs: [principalCV(DEPLOYER)],
            senderKey: process.env.PRIVATE_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            fee: 10000n, // 0.01 STX
            nonce,
            postConditionMode: PostConditionMode.Allow,
        };

        const transaction = await makeContractCall(txOptions);
        const response = await broadcastTransaction(transaction, NETWORK);

        if (response.error) {
            console.log(`   ❌ Failed: ${JSON.stringify(response, null, 2)}`);
            return { success: false, txid: null };
        }

        console.log(`   ✅ Success! TxID: ${response.txid}`);
        return { success: true, txid: response.txid };

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { success: false, txid: null };
    }
}

async function main() {
    console.log('🚀 Starting 30 Transaction Interaction Script (Minting CryptoPunks)\n');
    console.log(`Network: Stacks Mainnet`);
    console.log(`Contract: ${DEPLOYER}.${CONTRACT_NAME}\n`);

    let nonce = await getNextNonce(DEPLOYER);
    const results = [];

    for (let i = 1; i <= 30; i++) {
        const result = await executeTransaction(nonce++, `Minting CryptoPunk #${i}`);
        results.push(result);

        // Wait 2 seconds between transactions to avoid rate limits and mempool pressure
        await wait(2000);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n═══════════════════════════════════════');
    console.log('           TRANSACTION SUMMARY          ');
    console.log('═══════════════════════════════════════\n');
    console.log(`Total Transactions: 30`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`\n✅ All transactions processed!\n`);
}

main().catch(console.error);
