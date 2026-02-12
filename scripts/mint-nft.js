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

async function mintNFT(recipient) {
    console.log(`Minting NFT to ${recipient}...`);

    const txOptions = {
        contractAddress: address,
        contractName: 'example-nft',
        functionName: 'mint',
        functionArgs: [standardPrincipalCV(recipient)],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 50000n,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const response = await broadcastTransaction({ transaction, network });

    if (response.error) {
        console.error('Mint failed:', response.error);
        return null;
    }
    console.log(`NFT minted! TxID: ${response.txid}`);
    return response.txid;
}

const recipient = process.argv[2] || address;
mintNFT(recipient).catch(console.error);
