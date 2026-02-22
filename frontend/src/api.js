import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, MARKETPLACE_CONTRACT } from './config.js';

export class ApiService {
  async fetchListings() {
    try {
      const result = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT,
        functionName: 'get-listing-count',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      });
      
      return cvToJSON(result).value;
    } catch (error) {
      console.error('Error fetching listings:', error);
      return 0;
    }
  }

  async fetchListing(listingId) {
    try {
      const result = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKETPLACE_CONTRACT,
        functionName: 'get-listing',
        functionArgs: [listingId],
        senderAddress: CONTRACT_ADDRESS,
      });
      
      return cvToJSON(result);
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();
