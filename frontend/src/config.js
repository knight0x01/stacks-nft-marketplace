export const CONFIG = {
  CONTRACT_ADDRESS: 'SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P',
  CONTRACTS: {
    MARKETPLACE: 'nft-marketplace-v2',
    AUCTION: 'nft-auction-v2',
    OFFERS: 'nft-offers-v2',
  },
  NETWORK: 'mainnet',
  EXPLORER_URL: 'https://explorer.hiro.so',
};

export function getContractIdentifier(contractName) {
  return `${CONFIG.CONTRACT_ADDRESS}.${contractName}`;
}

export function getTxUrl(txId) {
  return `${CONFIG.EXPLORER_URL}/txid/${txId}`;
}
