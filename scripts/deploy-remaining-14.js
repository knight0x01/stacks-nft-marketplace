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

    console.log('\n🚀 Deploying remaining 14 NFT collections to Stacks Mainnet...\n');
    console.log(`Deployer address: ${address}`);
    console.log(`Starting nonce: ${nonce}\n`);

    const contracts = [
        ['wow', 'contracts/wow.clar'],
        ['my-pet-hooligan', 'contracts/my-pet-hooligan.clar'],
        ['y00ts', 'contracts/y00ts.clar'],
        ['veefriends', 'contracts/veefriends.clar'],
        ['creature-world', 'contracts/creature-world.clar'],
        ['lil-pudgys', 'contracts/lil-pudgys.clar'],
        ['on1-force', 'contracts/on1-force.clar'],
        ['pudgy-rods', 'contracts/pudgy-rods.clar'],
        ['tenktf', 'contracts/tenktf.clar'],
        ['cyberbrokers', 'contracts/cyberbrokers.clar'],
        ['toon-squad', 'contracts/toon-squad.clar'],
        ['fluf-world', 'contracts/fluf-world.clar'],
        ['azuki', 'contracts/azuki.clar'],
        ['beanz', 'contracts/beanz.clar'],
    ];

    for (const [name, path] of contracts) {
        await deployContract(name, path, nonce++);
    }

    console.log('\n✅ Remaining 14 contracts deployment completed.\n');
}

main().catch(console.error);
