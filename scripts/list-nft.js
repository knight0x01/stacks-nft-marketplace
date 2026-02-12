import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    getAddressFromPrivateKey,
    standardPrincipalCV,
    uintCV
} from '@stacks/transactions';
import stacksNetwork from '@stacks/network';
const { STACKS_MAINNET } = stacksNetwork;
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const network = STACKS_MAINNET;
const address = getAddressFromPrivateKey(privateKey, 'mainnet');

async function listNFT(nftContract, tokenId, price) {
    console.log(`Listing NFT ${tokenId} for ${price} microSTX...`);

    const txOptions = {
        contractAddress: address,
        contractName: 'nft-marketplace',
        functionName: 'create-listing',
        functionArgs: [
            standardPrincipalCV(nftContract),
            uintCV(tokenId),
            uintCV(price)
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 50000n,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const response = await broadcastTransaction({ transaction, network });

    if (response.error) {
        console.error('Listing failed:', response.error);
        return null;
    }
    console.log(`NFT listed! TxID: ${response.txid}`);
    return response.txid;
}

const nftContract = process.argv[2] || `${address}.example-nft`;
const tokenId = parseInt(process.argv[3]) || 1;
const price = parseInt(process.argv[4]) || 1000000;

listNFT(nftContract, tokenId, price).catch(console.error);
