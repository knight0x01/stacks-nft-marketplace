import 'dotenv/config';

export const CONSTANTS = {
  PLATFORM_FEE_PERCENT: 250,
  MAX_FEE_PERCENT: 1000,
  MIN_PRICE: 1000000,
  AUCTION_MIN_DURATION: 144,
  ROYALTY_MAX_PERCENT: 1000,
};

export const NETWORKS = {
  mainnet: 'https://api.mainnet.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
};

export const CONTRACT_NAMES = {
  MARKETPLACE: 'nft-marketplace',
  AUCTION: 'nft-auction',
  ESCROW: 'nft-escrow',
  ROYALTY: 'nft-royalty',
  EXAMPLE_NFT: 'example-nft',
  TRAIT: 'sip-009-nft-trait',
};

export const getConfig = () => ({
  network: process.env.NETWORK || 'mainnet',
  apiUrl: NETWORKS[process.env.NETWORK] || NETWORKS.mainnet,
  contractAddress: process.env.CONTRACT_ADDRESS,
  privateKey: process.env.PRIVATE_KEY,
});
