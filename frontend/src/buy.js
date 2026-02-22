import { openContractCall } from '@stacks/connect';
import { uintCV, contractPrincipalCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, MARKETPLACE_CONTRACT } from './config.js';

export async function buyNFT(listingId) {
  await openContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: MARKETPLACE_CONTRACT,
    functionName: 'buy-asset',
    functionArgs: [uintCV(listingId)],
    appDetails: {
      name: 'Stacks NFT Marketplace',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: (data) => {
      console.log('Purchase:', data.txId);
    },
  });
}
