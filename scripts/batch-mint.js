import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey,
    standardPrincipalCV
} from '@stacks/transactions';
import stacksNetwork from '@stacks/network';
const { STACKS_MAINNET } = stacksNetwork;
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const network = STACKS_MAINNET;
const address = getAddressFromPrivateKey(privateKey, 'mainnet');

async function getNonce(addr) {
    const response = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${addr}?proof=0`);
    const data = await response.json();
    return BigInt(data.nonce);
}

async function batchMint(recipients) {
    let nonce = await getNonce(address);
    const txids = [];

    for (const recipient of recipients) {
        console.log(`Minting NFT ${txids.length + 1}/${recipients.length} to ${recipient}...`);

        const txOptions = {
            contractAddress: address,
            contractName: 'example-nft',
            functionName: 'mint',
            functionArgs: [standardPrincipalCV(recipient)],
            senderKey: privateKey,
            network,
            anchorMode: AnchorMode.Any,
            fee: 50000n,
            nonce: nonce++,
            postConditionMode: PostConditionMode.Allow,
        };

        const transaction = await makeContractCall(txOptions);
        const response = await broadcastTransaction({ transaction, network });

        if (response.error) {
            console.error(`Failed:`, response.error);
        } else {
            console.log(`Success! TxID: ${response.txid}`);
            txids.push(response.txid);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\nBatch mint complete! ${txids.length}/${recipients.length} successful`);
    return txids;
}

const recipients = process.argv.slice(2);
if (recipients.length === 0) {
    console.log('Usage: node batch-mint.js <address1> <address2> ...');
    process.exit(1);
}

batchMint(recipients).catch(console.error);
