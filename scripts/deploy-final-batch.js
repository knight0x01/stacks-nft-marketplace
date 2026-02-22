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

    console.log('\n🚀 Deploying final batch of NFT collections to Stacks Mainnet...\n');
    console.log(`Deployer address: ${address}`);
    console.log(`Starting nonce: ${nonce}\n`);

    const contracts = [
        ['murakami-flowers', 'contracts/murakami-flowers.clar'],
        ['phantabear', 'contracts/phantabear.clar'],
        ['nakamigos', 'contracts/nakamigos.clar'],
        ['wonderpals', 'contracts/wonderpals.clar'],
        ['adidas', 'contracts/adidas.clar'],
        ['potatoz', 'contracts/potatoz.clar'],
        ['mayc', 'contracts/mayc.clar'],
        ['karafuru', 'contracts/karafuru.clar'],
        ['nft-worlds', 'contracts/nft-worlds.clar'],
        ['digidaigaku', 'contracts/digidaigaku.clar'],
        ['invisible-friends', 'contracts/invisible-friends.clar'],
        ['cryptokitties', 'contracts/cryptokitties.clar'],
        ['rare-apepe', 'contracts/rare-apepe.clar'],
    ];

    let successCount = 0;
    for (const [name, path] of contracts) {
        const result = await deployContract(name, path, nonce++);
        if (result) successCount++;
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`\n✅ Final batch completed. ${successCount} new contracts deployed.\n`);
}

main().catch(console.error);
