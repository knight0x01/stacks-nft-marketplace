#!/usr/bin/env node

/**
 * Bulk List NFTs Script
 * Lists multiple NFTs at once from a CSV file
 */

const { makeContractCall, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const fs = require('fs');
require('dotenv').config();

const NETWORK = process.env.NETWORK === 'mainnet'
    ? new StacksMainnet()
    : new StacksTestnet();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'nft-marketplace';

async function bulkListNFTs(csvPath) {
    console.log('🚀 Starting bulk listing process...\n');

    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    console.log(`📄 Found ${lines.length - 1} NFTs to list\n`);

    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const nftContract = values[0].trim();
        const tokenId = parseInt(values[1].trim());
        const price = parseInt(values[2].trim());

        console.log(`Listing NFT ${i}/${lines.length - 1}:`);
        console.log(`  Contract: ${nftContract}`);
        console.log(`  Token ID: ${tokenId}`);
        console.log(`  Price: ${price} microSTX\n`);

        try {
            const txOptions = {
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'create-listing',
                functionArgs: [
                    principalCV(nftContract),
                    uintCV(tokenId),
                    uintCV(price)
                ],
                senderKey: process.env.PRIVATE_KEY,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction(transaction, NETWORK);

            results.push({
                tokenId,
                txId: broadcastResponse.txid,
                status: 'success'
            });

            console.log(`✅ Listed successfully! TxID: ${broadcastResponse.txid}\n`);

            // Wait 2 seconds between transactions to avoid nonce issues
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`❌ Error listing NFT ${tokenId}:`, error.message, '\n');
            results.push({
                tokenId,
                error: error.message,
                status: 'failed'
            });
        }
    }

    // Summary
    console.log('\n📊 Bulk Listing Summary:');
    console.log(`Total: ${results.length}`);
    console.log(`Success: ${results.filter(r => r.status === 'success').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);

    // Save results
    fs.writeFileSync(
        'bulk-listing-results.json',
        JSON.stringify(results, null, 2)
    );
    console.log('\n💾 Results saved to bulk-listing-results.json');
}

// Run script
const csvPath = process.argv[2] || 'listings.csv';

if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    console.log('\nUsage: node bulk-list.js <path-to-csv>');
    console.log('\nCSV format:');
    console.log('nft_contract,token_id,price');
    console.log('SP2...ABC,1,1000000');
    console.log('SP2...ABC,2,2000000');
    process.exit(1);
}

bulkListNFTs(csvPath).catch(console.error);
