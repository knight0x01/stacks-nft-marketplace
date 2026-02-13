#!/usr/bin/env node

/**
 * Marketplace Interaction Script
 * Generates 50 transactions interacting with deployed contracts
 */

const {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    uintCV,
    principalCV,
    stringAsciiCV,
    PostConditionMode
} = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const NETWORK = new StacksMainnet();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEPLOYER = 'SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P';

// Helper to wait between transactions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getNextNonce(address) {
    const response = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${address}?proof=0`);
    const data = await response.json();
    return BigInt(data.nonce);
}

async function executeTransaction(contractName, functionName, functionArgs, nonce, description) {
    console.log(`\n[Tx ${nonce}] ${description}`);

    try {
        const txOptions = {
            contractAddress: DEPLOYER,
            contractName,
            functionName,
            functionArgs,
            senderKey: PRIVATE_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            fee: 50000n,
            nonce,
            postConditionMode: PostConditionMode.Allow,
        };

        const transaction = await makeContractCall(txOptions);
        const response = await broadcastTransaction(transaction, NETWORK);

        if (response.error) {
            console.log(`   ❌ Failed: ${response.error}`);
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
    console.log('🚀 Starting 50 Transaction Interaction Script\n');
    console.log(`Network: Stacks Mainnet`);
    console.log(`Deployer: ${DEPLOYER}\n`);

    let nonce = await getNextNonce(DEPLOYER);
    const results = [];
    let txCount = 0;

    // === NFT Minting (10 transactions) ===
    console.log('\n═══ MINTING NFTs (10 tx) ═══');
    for (let i = 1; i <= 10; i++) {
        const result = await executeTransaction(
            'example-nft',
            'mint',
            [principalCV(DEPLOYER)],
            nonce++,
            `Minting NFT #${i}`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Marketplace Listings (10 transactions) ===
    console.log('\n═══ CREATING MARKETPLACE LISTINGS (10 tx) ═══');
    for (let i = 1; i <= 10; i++) {
        const price = (1000000 + (i * 100000)); // 1 STX + increments
        const result = await executeTransaction(
            'nft-marketplace',
            'create-listing',
            [
                principalCV(`${DEPLOYER}.example-nft`),
                uintCV(i),
                uintCV(price)
            ],
            nonce++,
            `Listing NFT #${i} for ${price / 1000000} STX`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Featured Listings (5 transactions) ===
    console.log('\n═══ FEATURING LISTINGS (5 tx) ═══');
    for (let i = 1; i <= 5; i++) {
        const result = await executeTransaction(
            'nft-marketplace',
            'feature-listing',
            [uintCV(i)],
            nonce++,
            `Featuring listing #${i}`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Creating Offers (10 transactions) ===
    console.log('\n═══ CREATING OFFERS (10 tx) ═══');
    for (let i = 1; i <= 10; i++) {
        const offerAmount = 800000 + (i * 50000);
        const result = await executeTransaction(
            'nft-offers',
            'create-offer',
            [
                principalCV(`${DEPLOYER}.example-nft`),
                uintCV(i),
                uintCV(offerAmount),
                uintCV(144) // 1 day duration
            ],
            nonce++,
            `Creating offer for NFT #${i}: ${offerAmount / 1000000} STX`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Creating Auctions (5 transactions) ===
    console.log('\n═══ CREATING AUCTIONS (5 tx) ═══');
    for (let i = 1; i <= 5; i++) {
        const startPrice = 500000 + (i * 100000);
        const result = await executeTransaction(
            'nft-auction',
            'create-auction',
            [
                principalCV(`${DEPLOYER}.example-nft`),
                uintCV(10 + i),
                uintCV(startPrice),
                uintCV(288) // 2 days duration
            ],
            nonce++,
            `Creating auction for NFT #${10 + i}: starting at ${startPrice / 1000000} STX`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Collection Verification Requests (3 transactions) ===
    console.log('\n═══ COLLECTION VERIFICATION REQUESTS (3 tx) ═══');
    const collections = [
        `${DEPLOYER}.example-nft`,
        `${DEPLOYER}.nft-marketplace`,
        `${DEPLOYER}.nft-auction`
    ];
    for (let i = 0; i < 3; i++) {
        const result = await executeTransaction(
            'collection-verification',
            'request-verification',
            [
                principalCV(collections[i]),
                stringAsciiCV(`https://metadata.example.com/collection-${i}`)
            ],
            nonce++,
            `Requesting verification for collection ${i + 1}`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Verifying Collections (3 transactions) ===
    console.log('\n═══ VERIFYING COLLECTIONS (3 tx) ═══');
    for (let i = 0; i < 3; i++) {
        const result = await executeTransaction(
            'collection-verification',
            'verify-collection',
            [
                principalCV(collections[i]),
                stringAsciiCV(`https://verified.example.com/collection-${i}`)
            ],
            nonce++,
            `Verifying collection ${i + 1}`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Creating Whitelists (2 transactions) ===
    console.log('\n═══ CREATING WHITELISTS (2 tx) ═══');
    for (let i = 1; i <= 2; i++) {
        const result = await executeTransaction(
            'nft-whitelist',
            'create-whitelist',
            [
                stringAsciiCV(`Premium Sale ${i}`),
                uintCV(1440) // 10 days
            ],
            nonce++,
            `Creating whitelist: Premium Sale ${i}`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Creating Bundles (2 transactions) ===
    console.log('\n═══ CREATING BUNDLES (2 tx) ═══');
    for (let i = 1; i <= 2; i++) {
        const bundlePrice = 5000000 + (i * 1000000);
        const result = await executeTransaction(
            'nft-bundle',
            'create-bundle',
            [
                uintCV(bundlePrice),
                uintCV(3) // 3 NFTs per bundle
            ],
            nonce++,
            `Creating bundle #${i} with 3 NFTs for ${bundlePrice / 1000000} STX`
        );
        results.push(result);
        txCount++;
        await wait(1000);
    }

    // === Platform Fee Adjustments (2 transactions) ===
    console.log('\n═══ PLATFORM CONFIGURATION (2 tx) ═══');
    const result1 = await executeTransaction(
        'nft-marketplace',
        'set-platform-fee',
        [uintCV(300)], // 3%
        nonce++,
        'Setting platform fee to 3%'
    );
    results.push(result1);
    txCount++;
    await wait(1000);

    const result2 = await executeTransaction(
        'collection-verification',
        'set-verification-fee',
        [uintCV(2000000)], // 2 STX
        nonce++,
        'Setting verification fee to 2 STX'
    );
    results.push(result2);
    txCount++;

    // === Summary ===
    console.log('\n\n═══════════════════════════════════════');
    console.log('           TRANSACTION SUMMARY          ');
    console.log('═══════════════════════════════════════\n');

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Total Transactions: ${txCount}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`\nSuccess Rate: ${((successful / txCount) * 100).toFixed(1)}%`);

    console.log('\n📊 Transaction Breakdown:');
    console.log('   - NFT Minting: 10');
    console.log('   - Marketplace Listings: 10');
    console.log('   - Featured Listings: 5');
    console.log('   - Offers: 10');
    console.log('   - Auctions: 5');
    console.log('   - Verification Requests: 3');
    console.log('   - Collection Verifications: 3');
    console.log('   - Whitelists: 2');
    console.log('   - Bundles: 2');
    console.log('   - Platform Config: 2');

    console.log('\n✅ All transactions submitted!\n');
}

main().catch(console.error);
