import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { NETWORK, CONTRACT_ADDRESS, MARKETPLACE_CONTRACT } from './config.js';

export async function fetchListings() {
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
