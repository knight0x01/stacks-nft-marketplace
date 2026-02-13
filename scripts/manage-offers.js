#!/usr/bin/env node

/**
 * Manage Offers Script
 * Create, view, accept, and reject NFT offers
 */

const { makeContractCall, broadcastTransaction, callReadOnlyFunction, AnchorMode, uintCV, principalCV } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const NETWORK = process.env.NETWORK === 'mainnet'
    ? new StacksMainnet()
    : new StacksTestnet();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_NAME = 'nft-offers';

async function createOffer(nftContract, tokenId, amount, duration) {
    console.log('📝 Creating offer...');
    console.log(`NFT Contract: ${nftContract}`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`Amount: ${amount} microSTX`);
    console.log(`Duration: ${duration} blocks\n`);

    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'create-offer',
            functionArgs: [
                principalCV(nftContract),
                uintCV(tokenId),
                uintCV(amount),
                uintCV(duration)
            ],
            senderKey: process.env.PRIVATE_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, NETWORK);

        console.log('✅ Offer created successfully!');
        console.log(`Transaction ID: ${broadcastResponse.txid}`);
        console.log(`View on explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}`);

    } catch (error) {
        console.error('❌ Error creating offer:', error.message);
    }
}

async function viewOffer(offerId) {
    console.log(`🔍 Fetching offer ${offerId}...\n`);

    try {
        const result = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-offer',
            functionArgs: [uintCV(offerId)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });

        console.log('Offer Details:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Error fetching offer:', error.message);
    }
}

async function acceptOffer(offerId) {
    console.log(`✅ Accepting offer ${offerId}...\n`);

    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'accept-offer',
            functionArgs: [uintCV(offerId)],
            senderKey: process.env.PRIVATE_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, NETWORK);

        console.log('✅ Offer accepted successfully!');
        console.log(`Transaction ID: ${broadcastResponse.txid}`);

    } catch (error) {
        console.error('❌ Error accepting offer:', error.message);
    }
}

async function cancelOffer(offerId) {
    console.log(`❌ Canceling offer ${offerId}...\n`);

    try {
        const txOptions = {
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'cancel-offer',
            functionArgs: [uintCV(offerId)],
            senderKey: process.env.PRIVATE_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
        };

        const transaction = await makeContractCall(txOptions);
        const broadcastResponse = await broadcastTransaction(transaction, NETWORK);

        console.log('✅ Offer canceled successfully!');
        console.log(`Transaction ID: ${broadcastResponse.txid}`);

    } catch (error) {
        console.error('❌ Error canceling offer:', error.message);
    }
}

// CLI
const command = process.argv[2];

switch (command) {
    case 'create':
        const nftContract = process.argv[3];
        const tokenId = parseInt(process.argv[4]);
        const amount = parseInt(process.argv[5]);
        const duration = parseInt(process.argv[6]) || 144; // Default 1 day
        createOffer(nftContract, tokenId, amount, duration);
        break;

    case 'view':
        const viewOfferId = parseInt(process.argv[3]);
        viewOffer(viewOfferId);
        break;

    case 'accept':
        const acceptOfferId = parseInt(process.argv[3]);
        acceptOffer(acceptOfferId);
        break;

    case 'cancel':
        const cancelOfferId = parseInt(process.argv[3]);
        cancelOffer(cancelOfferId);
        break;

    default:
        console.log('Usage:');
        console.log('  node manage-offers.js create <nft-contract> <token-id> <amount> [duration]');
        console.log('  node manage-offers.js view <offer-id>');
        console.log('  node manage-offers.js accept <offer-id>');
        console.log('  node manage-offers.js cancel <offer-id>');
}
