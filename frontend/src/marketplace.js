import { openContractCall } from '@stacks/connect';
import { uintCV, principalCV, contractPrincipalCV } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, MARKETPLACE_CONTRACT } from './config.js';
import { eventBus } from './event-bus.js';
import { showNotification } from './utils/notifications.js';
import { SUCCESS, ERRORS } from './constants.js';

export class MarketplaceService {
  async listNFT(nftContract, tokenId, price) {
    try {
      await openContractCall({
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
          showNotification(SUCCESS.LISTING_CREATED, 'success');
          eventBus.emit('listing:created', data);
        },
      });
    } catch (error) {
      showNotification(ERRORS.TRANSACTION_FAILED, 'error');
      throw error;
    }
  }
}

export const marketplaceService = new MarketplaceService();
