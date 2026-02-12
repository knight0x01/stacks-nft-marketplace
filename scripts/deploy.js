import {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey
} from '@stacks/transactions';
import stacksNetwork from '@stacks/network';
const { STACKS_MAINNET } = stacksNetwork;
import { readFileSync } from 'fs';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in .env");
}

const network = STACKS_MAINNET;
const address = getAddressFromPrivateKey(privateKey, 'mainnet');
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
        fee: 100000n,
        nonce,
        postConditionMode: PostConditionMode.Allow,
        clarityVersion: 2,
    };

    const transaction = await makeContractDeploy(txOptions);
    const response = await broadcastTransaction({ transaction, network });

    if (response.error) {
        console.error(`Failed:`, response.error);
        return null;
    }
    console.log(`Success! TxID: ${response.txid}`);
    return response.txid;
}

async function main() {
    let nonce = await getNextNonce(address);
    
    await deployContract('sip-009-nft-trait', 'contracts/sip-009-nft-trait.clar', nonce++);
    await deployContract('example-nft', 'contracts/example-nft.clar', nonce++);
    await deployContract('nft-marketplace', 'contracts/nft-marketplace.clar', nonce++);
    await deployContract('nft-auction', 'contracts/nft-auction.clar', nonce++);
    await deployContract('nft-escrow', 'contracts/nft-escrow.clar', nonce++);
    await deployContract('nft-royalty', 'contracts/nft-royalty.clar', nonce++);
}

main().catch(console.error);
