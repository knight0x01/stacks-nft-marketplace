import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, MARKETPLACE_CONTRACT } from './config.js';
import { eventBus } from './event-bus.js';
import { showNotification } from './utils/notifications.js';
import { SUCCESS, ERRORS } from './constants.js';

export class BuyService {
  async buyNFT(listingId) {
    try {
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
          showNotification('Purchase successful', 'success');
          eventBus.emit('nft:purchased', data);
        },
      });
    } catch (error) {
      showNotification(ERRORS.TRANSACTION_FAILED, 'error');
      throw error;
    }
  }
}

export const buyService = new BuyService();
