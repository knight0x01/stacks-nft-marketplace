import {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey,
    TransactionVersion
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { readFileSync } from 'fs';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const network = new StacksMainnet();
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);
const VERSION = 'v2';
const BATCH_SIZE = 20;
const BATCH_DELAY = 300000;

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

async function getNextNonce(addr) {
    const response = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${addr}?proof=0`);
    const data = await response.json();
    return BigInt(data.nonce);
}

async function deployContract(contractName, filePath, nonce) {
    const versionedName = `${contractName}-${VERSION}`;
    console.log(`Deploying ${versionedName}...`);
    const contractContent = readFileSync(filePath, 'utf8');

    const txOptions = {
        contractName: versionedName,
        codeBody: contractContent,
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 30000n,
        nonce,
        postConditionMode: PostConditionMode.Allow,
        clarityVersion: 2,
    };

    const transaction = await makeContractDeploy(txOptions);
    const response = await broadcastTransaction(transaction, network);

    if (response.error) {
        console.error(`Failed: ${response.reason}`);
        return null;
    }
    console.log(`Success! TxID: ${response.txid}`);
    return response.txid;
}

async function main() {
    console.log(`🚀 Deploying ${VERSION} contracts to Stacks Mainnet`);
    console.log(`Deployer: ${address}`);
    console.log(`Batch size: ${BATCH_SIZE}, Delay: ${BATCH_DELAY/1000}s\n`);

    let nonce = await getNextNonce(address);
    let deployed = 0;

    for (let i = 0; i < contracts.length; i += BATCH_SIZE) {
        const batch = contracts.slice(i, i + BATCH_SIZE);
        console.log(`\n📦 Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(contracts.length/BATCH_SIZE)}`);
        
        for (const contract of batch) {
            const result = await deployContract(contract, `contracts/${contract}.clar`, nonce++);
            if (result) deployed++;
            await new Promise(r => setTimeout(r, 1000));
        }
        
        if (i + BATCH_SIZE < contracts.length) {
            console.log(`\n⏳ Waiting ${BATCH_DELAY/1000}s for mempool to clear...`);
            await new Promise(r => setTimeout(r, BATCH_DELAY));
            nonce = await getNextNonce(address);
        }
    }

    console.log(`\n✅ Complete! Deployed: ${deployed} ${VERSION} contracts`);
}

main().catch(console.error);
