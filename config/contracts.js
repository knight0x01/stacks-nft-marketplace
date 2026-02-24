export const NFT_CONTRACTS = [
  { name: 'sip-009-nft-trait', path: 'contracts/sip-009-nft-trait.clar', category: 'core' },
  { name: 'example-nft', path: 'contracts/example-nft.clar', category: 'core' },
  { name: 'nft-marketplace', path: 'contracts/nft-marketplace.clar', category: 'core' },
  { name: 'nft-auction', path: 'contracts/nft-auction.clar', category: 'core' },
  { name: 'nft-escrow', path: 'contracts/nft-escrow.clar', category: 'core' },
  { name: 'nft-royalty', path: 'contracts/nft-royalty.clar', category: 'core' },
  { name: 'nft-offers', path: 'contracts/nft-offers.clar', category: 'core' },
  { name: 'collection-verification', path: 'contracts/collection-verification.clar', category: 'core' },
  { name: 'nft-bundle', path: 'contracts/nft-bundle.clar', category: 'core' },
  { name: 'nft-whitelist', path: 'contracts/nft-whitelist.clar', category: 'core' },
  
  { name: 'cryptopunks', path: 'contracts/cryptopunks.clar', category: 'blue-chip' },
  { name: 'bayc', path: 'contracts/bayc.clar', category: 'blue-chip' },
  { name: 'mayc', path: 'contracts/mayc.clar', category: 'blue-chip' },
  { name: 'azuki', path: 'contracts/azuki.clar', category: 'blue-chip' },
  { name: 'clonex', path: 'contracts/clonex.clar', category: 'blue-chip' },
  { name: 'moonbirds', path: 'contracts/moonbirds.clar', category: 'blue-chip' },
  { name: 'doodles', path: 'contracts/doodles.clar', category: 'blue-chip' },
  { name: 'pudgy-penguins', path: 'contracts/pudgy-penguins.clar', category: 'blue-chip' },
];

export function getContractsByCategory(category) {
  return NFT_CONTRACTS.filter(c => c.category === category);
}

export function getCoreContracts() {
  return getContractsByCategory('core');
}

export function getCollectionContracts() {
  return NFT_CONTRACTS.filter(c => c.category !== 'core');
}
