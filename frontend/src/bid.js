import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, AUCTION_CONTRACT } from './config.js';
import { eventBus } from './event-bus.js';
import { showNotification } from './utils/notifications.js';
import { ERRORS } from './constants.js';

export class BidService {
  async placeBid(auctionId, amount) {
    try {
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
          showNotification('Bid placed', 'success');
          eventBus.emit('bid:placed', data);
        },
      });
    } catch (error) {
      showNotification(ERRORS.TRANSACTION_FAILED, 'error');
      throw error;
    }
  }
}

export const bidService = new BidService();
