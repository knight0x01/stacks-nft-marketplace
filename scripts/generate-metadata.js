import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function generateMetadata(tokenId, name, description, imageUrl, attributes = []) {
    return {
        name: name || `NFT #${tokenId}`,
        description: description || `Unique NFT from Stacks NFT Marketplace`,
        image: imageUrl || `https://example.com/images/${tokenId}.png`,
        attributes: attributes.length > 0 ? attributes : [
            { trait_type: 'Rarity', value: 'Common' },
            { trait_type: 'Generation', value: '1' }
        ],
        external_url: `https://marketplace.example.com/nft/${tokenId}`,
        tokenId: tokenId
    };
}

function batchGenerateMetadata(count, outputDir = './metadata') {
    try {
        mkdirSync(outputDir, { recursive: true });
    } catch (err) {
        // Directory exists
    }

    console.log(`Generating ${count} metadata files...\n`);

    for (let i = 1; i <= count; i++) {
        const metadata = generateMetadata(
            i,
            `Stacks NFT #${i}`,
            `A unique NFT from the Stacks NFT Marketplace collection`,
            `https://example.com/images/${i}.png`,
            [
                { trait_type: 'Rarity', value: i % 10 === 0 ? 'Rare' : 'Common' },
                { trait_type: 'Generation', value: '1' },
                { trait_type: 'Number', value: i.toString() }
            ]
        );

        const filepath = join(outputDir, `${i}.json`);
        writeFileSync(filepath, JSON.stringify(metadata, null, 2));
        
        if (i % 10 === 0) {
            console.log(`Generated ${i}/${count} metadata files...`);
        }
    }

    console.log(`\n✅ Successfully generated ${count} metadata files in ${outputDir}/`);
}

const count = parseInt(process.argv[2]) || 100;
const outputDir = process.argv[3] || './metadata';

batchGenerateMetadata(count, outputDir);
