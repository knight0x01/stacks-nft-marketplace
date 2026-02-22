import { openContractCall } from '@stacks/connect';
import { uintCV, contractPrincipalCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, AUCTION_CONTRACT } from './config.js';
import { eventBus } from './event-bus.js';
import { showNotification } from './utils/notifications.js';
import { SUCCESS, ERRORS } from './constants.js';

export class AuctionService {
  async createAuction(nftContract, tokenId, startPrice, duration) {
    try {
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
          showNotification('Auction created', 'success');
          eventBus.emit('auction:created', data);
        },
      });
    } catch (error) {
      showNotification(ERRORS.TRANSACTION_FAILED, 'error');
      throw error;
    }
  }
}

export const auctionService = new AuctionService();
