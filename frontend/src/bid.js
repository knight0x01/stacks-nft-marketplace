import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, AUCTION_CONTRACT } from './config.js';

export async function placeBid(auctionId, amount) {
  await openContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: AUCTION_CONTRACT,
    functionName: 'place-bid',
    functionArgs: [uintCV(auctionId), uintCV(amount)],
    appDetails: {
      name: 'Stacks NFT Marketplace',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: (data) => {
      console.log('Bid placed:', data.txId);
    },
  });
}
