import { openContractCall } from '@stacks/connect';
import { uintCV, contractPrincipalCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, AUCTION_CONTRACT } from './config.js';

export async function createAuction(nftContract, tokenId, startPrice, duration) {
  await openContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: AUCTION_CONTRACT,
    functionName: 'create-auction',
    functionArgs: [
      contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
      uintCV(tokenId),
      uintCV(startPrice),
      uintCV(duration),
    ],
    appDetails: {
      name: 'Stacks NFT Marketplace',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: (data) => {
      console.log('Auction created:', data.txId);
    },
  });
}
