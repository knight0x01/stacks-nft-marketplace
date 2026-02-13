#!/usr/bin/env node

/**
 * NFT Transfer Script
 * Direct transfer of NFTs between addresses
 */

const { makeContractCall, broadcastTransaction, AnchorMode, uintCV, principalCV, standardPrincipalCV } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const NETWORK = process.env.NETWORK === 'mainnet'
    ? new StacksMainnet()
    : new StacksTestnet();

async function transferNFT(nftContract, tokenId, recipient) {
    console.log('🔄 Transferring NFT...');
    console.log(`NFT Contract: ${nftContract}`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`Recipient: ${recipient}\n`);

    try {
        const txOptions = {
            contractAddress: nftContract.split('.')[0],
            contractName: nftContract.split('.')[1],
            functionName: 'transfer',
            functionArgs: [
                uintCV(tokenId),
                standardPrincipalCV(process.env.SENDER_ADDRESS),
                standardPrincipalCV(recipient)
            ],
            senderKey: process.env.PRIVATE_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, NETWORK);

        console.log('✅ NFT transferred successfully!');
        console.log(`Transaction ID: ${broadcastResponse.txid}`);
        console.log(`View on explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}`);

    } catch (error) {
        console.error('❌ Error transferring NFT:', error.message);
    }
}

async function batchTransfer(csvPath) {
    const fs = require('fs');
    console.log('🚀 Starting batch transfer...\n');

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    console.log(`📄 Found ${lines.length - 1} transfers to process\n`);

    for (let i = 1; i < lines.length; i++) {
        const [nftContract, tokenId, recipient] = lines[i].split(',').map(s => s.trim());

        console.log(`Transfer ${i}/${lines.length - 1}:`);
        await transferNFT(nftContract, parseInt(tokenId), recipient);
        console.log('');

        // Wait between transactions
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('✅ Batch transfer complete!');
}

// CLI
const command = process.argv[2];

if (command === 'batch') {
    const csvPath = process.argv[3];
    if (!csvPath) {
        console.error('❌ Please provide CSV file path');
        console.log('\nUsage: node transfer-nft.js batch <csv-file>');
        console.log('\nCSV format:');
        console.log('nft_contract,token_id,recipient');
        console.log('SP2...ABC.my-nft,1,SP2...XYZ');
        process.exit(1);
    }
    batchTransfer(csvPath);
} else {
    const nftContract = process.argv[2];
    const tokenId = parseInt(process.argv[3]);
    const recipient = process.argv[4];

    if (!nftContract || !tokenId || !recipient) {
        console.log('Usage:');
        console.log('  Single: node transfer-nft.js <nft-contract> <token-id> <recipient>');
        console.log('  Batch:  node transfer-nft.js batch <csv-file>');
        process.exit(1);
    }

    transferNFT(nftContract, tokenId, recipient);
}
