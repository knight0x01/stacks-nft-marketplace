import { openContractCall } from '@stacks/connect';
import { 
  uintCV, 
  principalCV, 
  contractPrincipalCV,
  PostConditionMode,
  AnchorMode,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
} from '@stacks/transactions';
import { network, userSession } from './wallet.js';

const CONTRACT_ADDRESS = 'SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P';
const MARKETPLACE_CONTRACT = 'nft-marketplace-v2';
const AUCTION_CONTRACT = 'nft-auction-v2';
const OFFERS_CONTRACT = 'nft-offers-v2';

// Marketplace Functions
export async function listNFT(nftContract, tokenId, price, expiry) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(tokenId),
    uintCV(price),
    uintCV(expiry),
  ];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: MARKETPLACE_CONTRACT,
    functionName: 'list-nft',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Transaction:', data.txId);
      return data;
    },
  });
}

export async function buyNFT(nftContract, listingId, price, seller) {
  const userAddress = userSession.loadUserData().profile.stxAddress.mainnet;
  
  const postConditions = [
    makeStandardSTXPostCondition(
      userAddress,
      FungibleConditionCode.LessEqual,
      price
    ),
  ];

  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(listingId),
  ];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: MARKETPLACE_CONTRACT,
    functionName: 'buy-nft',
    functionArgs,
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Purchase transaction:', data.txId);
      return data;
    },
  });
}

export async function unlistNFT(nftContract, listingId) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(listingId),
  ];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: MARKETPLACE_CONTRACT,
    functionName: 'unlist-nft',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('Unlist transaction:', data.txId);
      return data;
    },
  });
}

export async function updatePrice(listingId, newPrice) {
  const functionArgs = [uintCV(listingId), uintCV(newPrice)];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: MARKETPLACE_CONTRACT,
    functionName: 'update-price',
    functionArgs,
    postConditionMode: PostConditionMode.Allow,
    onFinish: (data) => {
      console.log('Update price transaction:', data.txId);
      return data;
    },
  });
}

// Auction Functions
export async function createAuction(nftContract, tokenId, reservePrice, duration) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(tokenId),
    uintCV(reservePrice),
    uintCV(duration),
  ];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: AUCTION_CONTRACT,
    functionName: 'create-auction',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Auction created:', data.txId);
      return data;
    },
  });
}

export async function placeBid(auctionId, bidAmount) {
  const userAddress = userSession.loadUserData().profile.stxAddress.mainnet;
  
  const postConditions = [
    makeStandardSTXPostCondition(
      userAddress,
      FungibleConditionCode.Equal,
      bidAmount
    ),
  ];

  const functionArgs = [uintCV(auctionId), uintCV(bidAmount)];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: AUCTION_CONTRACT,
    functionName: 'place-bid',
    functionArgs,
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Bid placed:', data.txId);
      return data;
    },
  });
}

// Offers Functions
export async function makeOffer(nftContract, tokenId, amount, expiry) {
  const userAddress = userSession.loadUserData().profile.stxAddress.mainnet;
  
  const postConditions = [
    makeStandardSTXPostCondition(
      userAddress,
      FungibleConditionCode.Equal,
      amount
    ),
  ];

  const functionArgs = [
    principalCV(CONTRACT_ADDRESS + '.' + nftContract),
    uintCV(tokenId),
    uintCV(amount),
    uintCV(expiry),
  ];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: OFFERS_CONTRACT,
    functionName: 'make-offer',
    functionArgs,
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Offer made:', data.txId);
      return data;
    },
  });
}

export async function acceptOffer(nftContract, offerId) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(offerId),
  ];

  return openContractCall({
    network,
    anchorMode: AnchorMode.Any,
    contractAddress: CONTRACT_ADDRESS,
    contractName: OFFERS_CONTRACT,
    functionName: 'accept-offer',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Offer accepted:', data.txId);
      return data;
    },
  });
}
