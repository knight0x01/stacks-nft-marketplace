import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import { getAddress } from './wallet.js';
import { CONFIG } from './config.js';

const { CONTRACT_ADDRESS, CONTRACTS } = CONFIG;

// Marketplace Functions
export async function listNFT(nftContract, tokenId, price, expiry) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.MARKETPLACE,
    functionName: 'list-nft',
    functionArgs: [
      Cl.contractPrincipal(CONTRACT_ADDRESS, nftContract),
      Cl.uint(tokenId),
      Cl.uint(price),
      Cl.uint(expiry),
    ],
    network: 'mainnet',
  });

  return response;
}

export async function buyNFT(nftContract, listingId, price) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.MARKETPLACE,
    functionName: 'buy-nft',
    functionArgs: [
      Cl.contractPrincipal(CONTRACT_ADDRESS, nftContract),
      Cl.uint(listingId),
    ],
    network: 'mainnet',
  });

  return response;
}

export async function unlistNFT(nftContract, listingId) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.MARKETPLACE,
    functionName: 'unlist-nft',
    functionArgs: [
      Cl.contractPrincipal(CONTRACT_ADDRESS, nftContract),
      Cl.uint(listingId),
    ],
    network: 'mainnet',
  });

  return response;
}

export async function updatePrice(listingId, newPrice) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.MARKETPLACE,
    functionName: 'update-price',
    functionArgs: [
      Cl.uint(listingId),
      Cl.uint(newPrice),
    ],
    network: 'mainnet',
  });

  return response;
}

// Auction Functions
export async function createAuction(nftContract, tokenId, reservePrice, duration) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.AUCTION,
    functionName: 'create-auction',
    functionArgs: [
      Cl.contractPrincipal(CONTRACT_ADDRESS, nftContract),
      Cl.uint(tokenId),
      Cl.uint(reservePrice),
      Cl.uint(duration),
    ],
    network: 'mainnet',
  });

  return response;
}

export async function placeBid(auctionId, bidAmount) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.AUCTION,
    functionName: 'place-bid',
    functionArgs: [
      Cl.uint(auctionId),
      Cl.uint(bidAmount),
    ],
    network: 'mainnet',
  });

  return response;
}

// Offers Functions
export async function makeOffer(nftContract, tokenId, amount, expiry) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.OFFERS,
    functionName: 'make-offer',
    functionArgs: [
      Cl.contractPrincipal(CONTRACT_ADDRESS, nftContract),
      Cl.uint(tokenId),
      Cl.uint(amount),
      Cl.uint(expiry),
    ],
    network: 'mainnet',
  });

  return response;
}

export async function acceptOffer(nftContract, offerId) {
  const response = await request('stx_callContract', {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACTS.OFFERS,
    functionName: 'accept-offer',
    functionArgs: [
      Cl.contractPrincipal(CONTRACT_ADDRESS, nftContract),
      Cl.uint(offerId),
    ],
    network: 'mainnet',
  });

  return response;
}
