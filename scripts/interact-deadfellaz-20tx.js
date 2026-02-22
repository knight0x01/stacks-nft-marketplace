import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey,
    TransactionVersion,
    uintCV,
    principalCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const network = new StacksMainnet();
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);

async function getNonce() {
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${address}?proof=0`, {
                signal: AbortSignal.timeout(10000)
            });
            return BigInt((await res.json()).nonce);
        } catch (e) {
            if (i === 2) throw e;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function interact(functionName, args, nonce) {
    const tx = await makeContractCall({
        contractAddress: address,
        contractName: 'deadfellaz',
        functionName,
        functionArgs: args,
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 15000n,
        nonce,
        postConditionMode: PostConditionMode.Allow,
    });

    for (let i = 0; i < 3; i++) {
        try {
            const res = await broadcastTransaction(tx, network);
            console.log(res.error ? `❌ ${functionName}` : `✅ ${functionName}: ${res.txid}`);
            return res.txid;
        } catch (e) {
            if (i === 2) {
                console.log(`❌ ${functionName}: timeout`);
                return null;
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function main() {
    let nonce = await getNonce();
    console.log(`\n🎮 Interacting with deadfellaz (20 transactions)\n`);

    const ops = [
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['transfer', [uintCV(1), principalCV(address), principalCV(address)]],
        ['transfer', [uintCV(2), principalCV(address), principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['get-last-token-id', []],
        ['transfer', [uintCV(3), principalCV(address), principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['get-last-token-id', []],
        ['transfer', [uintCV(4), principalCV(address), principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['mint', [principalCV(address)]],
        ['get-last-token-id', []],
    ];

    for (const [fn, args] of ops) {
        await interact(fn, args, nonce++);
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n✅ 20 transactions completed\n`);
}

main().catch(console.error);
