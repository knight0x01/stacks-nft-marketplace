export const CONSTANTS = {
  PLATFORM_FEE_PERCENT: 250, // 2.5%
  MAX_FEE_PERCENT: 1000, // 10%
  MIN_PRICE: 1000000, // 1 STX
  AUCTION_MIN_DURATION: 144, // ~24 hours in blocks
  ROYALTY_MAX_PERCENT: 1000, // 10%
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
