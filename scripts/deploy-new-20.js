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
if (!privateKey) {
    throw new Error("Missing required environment variable");
}

const network = new StacksMainnet();
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);
console.log(`Deploying from address: ${address}`);

async function getNextNonce(addr) {
    const response = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${addr}?proof=0`);
    const data = await response.json();
    return BigInt(data.nonce);
}

async function deployContract(contractName, filePath, nonce) {
    console.log(`Deploying ${contractName}...`);
    const contractContent = readFileSync(filePath, 'utf8');

    const txOptions = {
        contractName,
        codeBody: contractContent,
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 20000n,
        nonce,
        postConditionMode: PostConditionMode.Allow,
        clarityVersion: 2,
    };

    const transaction = await makeContractDeploy(txOptions);
    const response = await broadcastTransaction(transaction, network);

    if (response.error) {
        console.error(`Failed:`, JSON.stringify(response, null, 2));
        return null;
    }
    console.log(`Success! TxID: ${response.txid}`);
    return response.txid;
}

async function main() {
    let nonce = await getNextNonce(address);

    console.log('\n🚀 Deploying 20 new NFT collections to Stacks Mainnet...\n');
    console.log(`Deployer address: ${address}`);
    console.log(`Starting nonce: ${nonce}\n`);

    const contracts = [
        ['autoglyphs', 'contracts/autoglyphs.clar'],
        ['loot', 'contracts/loot.clar'],
        ['mfers', 'contracts/mfers.clar'],
        ['forgotten-runes', 'contracts/forgotten-runes.clar'],
        ['chimpers', 'contracts/chimpers.clar'],
        ['tubby-cats', 'contracts/tubby-cats.clar'],
        ['terraforms', 'contracts/terraforms.clar'],
        ['sandbox-land', 'contracts/sandbox-land.clar'],
        ['decentraland', 'contracts/decentraland.clar'],
        ['blitmap', 'contracts/blitmap.clar'],
        ['hashmasks', 'contracts/hashmasks.clar'],
        ['wolf-game', 'contracts/wolf-game.clar'],
        ['chain-runners', 'contracts/chain-runners.clar'],
        ['animetas', 'contracts/animetas.clar'],
        ['tiny-dinos', 'contracts/tiny-dinos.clar'],
        ['eightliens', 'contracts/eightliens.clar'],
        ['jenkins-valet', 'contracts/jenkins-valet.clar'],
        ['dreadfulz', 'contracts/dreadfulz.clar'],
        ['quirkies', 'contracts/quirkies.clar'],
        ['illuminati', 'contracts/illuminati.clar'],
    ];

    for (const [name, path] of contracts) {
        await deployContract(name, path, nonce++);
    }

    console.log('\n✅ 20 new NFT collections deploy batch completed.\n');
}

main().catch(console.error);
