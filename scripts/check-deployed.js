import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);

const contracts = [
    'cryptopunks', 'bayc', 'mayc', 'azuki', 'clonex', 'moonbirds', 'doodles', 'pudgy-penguins',
    'cool-cats', 'wow', 'meebits', 'milady', 'invisible-friends', 'cyberkongz', 'art-blocks',
    'degods', 'y00ts', 'otherdeed', 'sewer-pass', 'checks', 'opepen', 'nakamigos', 'captainz',
    'potatoz', 'beanz', 'renga', 'sappy-seals', 'deadfellaz', 'creature-world', 'mekaverse',
    'hape-prime', 'prime-ape-planet', 'gutter-cat-gang', 'phantabear', 'karafuru',
    'murakami-flowers', 'valhalla', 'digidaigaku', 'moonrunners', 'goblintown', 'nouns',
    'cryptokitties', 'bakc', 'veefriends', 'nft-worlds', 'fluf-world', 'rumble-kong-league',
    'cryptoadz', 'on1-force', 'parallel-alpha', 'tenktf', 'adidas', 'mnlth', 'rare-apepe',
    'gucci-grail', 'koda', 'chemistry-club', 'hv-mtl', 'lotm', 'pudgy-rods', 'lil-pudgys',
    'my-pet-hooligan', 'pixelmon', 'kaijukingz', 'boss-beauties', 'supducks', 'toon-squad',
    'lazy-lions', 'cyberbrokers', 'wonderpals', 'autoglyphs', 'loot', 'mfers',
    'forgotten-runes', 'chimpers', 'tubby-cats', 'terraforms', 'sandbox-land', 'decentraland',
    'blitmap', 'hashmasks', 'wolf-game', 'chain-runners', 'animetas', 'tiny-dinos',
    'eightliens', 'jenkins-valet', 'dreadfulz', 'quirkies', 'illuminati'
];

async function checkContract(name) {
    const url = `https://api.mainnet.hiro.so/v2/contracts/interface/${address}/${name}`;
    const response = await fetch(url);
    return response.ok;
}

async function main() {
    console.log(`Checking contracts for: ${address}\n`);
    
    const deployed = [];
    const notDeployed = [];
    
    for (const contract of contracts) {
        const exists = await checkContract(contract);
        if (exists) {
            deployed.push(contract);
            console.log(`✅ ${contract}`);
        } else {
            notDeployed.push(contract);
            console.log(`❌ ${contract}`);
        }
        await new Promise(r => setTimeout(r, 100));
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`Deployed: ${deployed.length}/${contracts.length}`);
    console.log(`Not deployed: ${notDeployed.length}/${contracts.length}`);
    
    if (notDeployed.length > 0) {
        console.log(`\n📝 Not deployed contracts:`);
        notDeployed.forEach(c => console.log(`  - ${c}`));
    }
}

main().catch(console.error);
