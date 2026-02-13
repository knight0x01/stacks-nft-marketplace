#!/usr/bin/env node

/**
 * Collection Statistics Script
 * Calculate floor price, volume, and sales stats for NFT collections
 */

const { callReadOnlyFunction, cvToJSON, uintCV, principalCV } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const NETWORK = process.env.NETWORK === 'mainnet'
    ? new StacksMainnet()
    : new StacksTestnet();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function getCollectionStats(collectionAddress) {
    console.log(`📊 Fetching statistics for collection: ${collectionAddress}\n`);

    const stats = {
        floorPrice: null,
        totalVolume: 0,
        totalSales: 0,
        averagePrice: 0,
        activeListings: 0,
        uniqueSellers: new Set(),
        priceHistory: []
    };

    try {
        // Fetch all listings for this collection
        // Note: In production, you'd query an indexer or iterate through known token IDs
        console.log('Calculating collection statistics...\n');

        // Simulated data - in production, fetch from blockchain
        const sampleListings = [
            { tokenId: 1, price: 1000000, active: true, seller: 'SP2...ABC' },
            { tokenId: 2, price: 2000000, active: true, seller: 'SP2...DEF' },
            { tokenId: 3, price: 1500000, active: false, seller: 'SP2...GHI' },
            { tokenId: 4, price: 3000000, active: true, seller: 'SP2...JKL' },
        ];

        let prices = [];

        for (const listing of sampleListings) {
            if (listing.active) {
                stats.activeListings++;
                prices.push(listing.price);
                stats.uniqueSellers.add(listing.seller);
            } else {
                stats.totalSales++;
                stats.totalVolume += listing.price;
            }
            stats.priceHistory.push(listing.price);
        }

        // Calculate floor price (lowest active listing)
        if (prices.length > 0) {
            stats.floorPrice = Math.min(...prices);
        }

        // Calculate average price
        if (stats.priceHistory.length > 0) {
            stats.averagePrice = stats.priceHistory.reduce((a, b) => a + b, 0) / stats.priceHistory.length;
        }

        // Display results
        console.log('═══════════════════════════════════════');
        console.log('         COLLECTION STATISTICS         ');
        console.log('═══════════════════════════════════════\n');

        console.log(`📍 Collection: ${collectionAddress}\n`);

        console.log('💰 Price Metrics:');
        console.log(`   Floor Price: ${stats.floorPrice ? (stats.floorPrice / 1000000).toFixed(2) + ' STX' : 'N/A'}`);
        console.log(`   Average Price: ${(stats.averagePrice / 1000000).toFixed(2)} STX`);
        console.log(`   Total Volume: ${(stats.totalVolume / 1000000).toFixed(2)} STX\n`);

        console.log('📈 Activity Metrics:');
        console.log(`   Active Listings: ${stats.activeListings}`);
        console.log(`   Total Sales: ${stats.totalSales}`);
        console.log(`   Unique Sellers: ${stats.uniqueSellers.size}\n`);

        console.log('═══════════════════════════════════════\n');

        // Save to file
        const fs = require('fs');
        fs.writeFileSync(
            `collection-stats-${Date.now()}.json`,
            JSON.stringify({
                collection: collectionAddress,
                timestamp: new Date().toISOString(),
                ...stats,
                uniqueSellers: Array.from(stats.uniqueSellers)
            }, null, 2)
        );

        console.log('💾 Stats saved to collection-stats-*.json\n');

    } catch (error) {
        console.error('❌ Error fetching collection stats:', error.message);
    }
}

// Run script
const collectionAddress = process.argv[2];

if (!collectionAddress) {
    console.error('❌ Please provide a collection address');
    console.log('\nUsage: node collection-stats.js <collection-address>');
    process.exit(1);
}

getCollectionStats(collectionAddress).catch(console.error);
