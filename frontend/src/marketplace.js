import { openContractCall } from '@stacks/connect';
import { uintCV, principalCV, contractPrincipalCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, MARKETPLACE_CONTRACT } from './config.js';
import { userSession } from './auth.js';

export async function listNFT(nftContract, tokenId, price) {
  const options = {
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: MARKETPLACE_CONTRACT,
    functionName: 'list-asset',
    functionArgs: [
      contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
      uintCV(tokenId),
      uintCV(price),
    ],
    appDetails: {
      name: 'Stacks NFT Marketplace',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: (data) => {
      console.log('Transaction:', data.txId);
    },
  };

  await openContractCall(options);
}
