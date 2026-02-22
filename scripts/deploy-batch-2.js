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

    console.log('\n🚀 Deploying 20 NFT collections (Batch 2) to Stacks Mainnet...\n');
    console.log(`Deployer address: ${address}`);
    console.log(`Starting nonce: ${nonce}\n`);

    const contracts = [
        ['mekaverse', 'contracts/mekaverse.clar'],
        ['milady', 'contracts/milady.clar'],
        ['hape-prime', 'contracts/hape-prime.clar'],
        ['sewer-pass', 'contracts/sewer-pass.clar'],
        ['pixelmon', 'contracts/pixelmon.clar'],
        ['supducks', 'contracts/supducks.clar'],
        ['gucci-grail', 'contracts/gucci-grail.clar'],
        ['degods', 'contracts/degods.clar'],
        ['lazy-lions', 'contracts/lazy-lions.clar'],
        ['cyberkongz', 'contracts/cyberkongz.clar'],
        ['pudgy-penguins', 'contracts/pudgy-penguins.clar'],
        ['hv-mtl', 'contracts/hv-mtl.clar'],
        ['valhalla', 'contracts/valhalla.clar'],
        ['doodles', 'contracts/doodles.clar'],
        ['moonbirds', 'contracts/moonbirds.clar'],
        ['bayc', 'contracts/bayc.clar'],
        ['parallel-alpha', 'contracts/parallel-alpha.clar'],
        ['gutter-cat-gang', 'contracts/gutter-cat-gang.clar'],
        ['kaijukingz', 'contracts/kaijukingz.clar'],
        ['mnlth', 'contracts/mnlth.clar'],
    ];

    for (const [name, path] of contracts) {
        await deployContract(name, path, nonce++);
    }

    console.log('\n✅ Batch 2 deployment completed.\n');
}

main().catch(console.error);
