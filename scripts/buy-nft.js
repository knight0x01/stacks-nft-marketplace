import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey,
    uintCV
} from '@stacks/transactions';
import stacksNetwork from '@stacks/network';
const { STACKS_MAINNET } = stacksNetwork;
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const network = STACKS_MAINNET;
const address = getAddressFromPrivateKey(privateKey, 'mainnet');

async function buyNFT(listingId) {
    console.log(`Purchasing listing ${listingId}...`);

    const txOptions = {
        contractAddress: address,
        contractName: 'nft-marketplace',
        functionName: 'purchase-listing',
        functionArgs: [uintCV(listingId)],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 50000n,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const response = await broadcastTransaction({ transaction, network });

    if (response.error) {
        console.error('Purchase failed:', response.error);
        return null;
    }
    console.log(`NFT purchased! TxID: ${response.txid}`);
    return response.txid;
}

const listingId = parseInt(process.argv[2]) || 1;
buyNFT(listingId).catch(console.error);
