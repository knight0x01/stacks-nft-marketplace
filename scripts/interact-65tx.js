import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey,
    TransactionVersion,
    standardPrincipalCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const network = new StacksMainnet();
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);
const CONTRACT = 'cryptopunks';
const TX_COUNT = 65;
const GAS_FEE = 7000n; // 0.007 STX

async function getNextNonce(addr) {
    const response = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${addr}?proof=0`);
    const data = await response.json();
    return BigInt(data.nonce);
}

async function mintNFT(recipient, nonce) {
    const txOptions = {
        contractAddress: address,
        contractName: CONTRACT,
        functionName: 'mint',
        functionArgs: [standardPrincipalCV(recipient)],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: GAS_FEE,
        nonce,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const response = await broadcastTransaction(transaction, network);

    if (response.error) {
        console.error(`TX ${nonce}: Failed - ${response.reason}`);
        return null;
    }
    console.log(`TX ${nonce}: ${response.txid}`);
    return response.txid;
}

async function main() {
    console.log(`🚀 Interacting with ${CONTRACT}`);
    console.log(`Address: ${address}`);
    console.log(`Transactions: ${TX_COUNT}`);
    console.log(`Gas: 0.007 STX\n`);

    let nonce = await getNextNonce(address);
    let success = 0;

    for (let i = 0; i < TX_COUNT; i++) {
        const result = await mintNFT(address, nonce++);
        if (result) success++;
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n✅ Complete! Success: ${success}/${TX_COUNT}`);
}

main().catch(console.error);
