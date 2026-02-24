import { openContractCall } from '@stacks/connect';
import { 
  uintCV, 
  contractPrincipalCV,
  PostConditionMode,
  AnchorMode,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
} from '@stacks/transactions';
import { network, userSession, getAddress } from './wallet.js';

const CONTRACT_ADDRESS = 'SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P';
const MARKETPLACE_CONTRACT = 'nft-marketplace-v2';
const AUCTION_CONTRACT = 'nft-auction-v2';
const OFFERS_CONTRACT = 'nft-offers-v2';

async function callContract(contractName, functionName, functionArgs, postConditions = []) {
  return new Promise((resolve, reject) => {
    openContractCall({
      network,
      anchorMode: AnchorMode.Any,
      contractAddress: CONTRACT_ADDRESS,
      contractName,
      functionName,
      functionArgs,
      postConditions,
      postConditionMode: postConditions.length > 0 ? PostConditionMode.Deny : PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Transaction submitted:', data.txId);
        resolve(data);
      },
      onCancel: () => {
        reject(new Error('Transaction cancelled'));
      },
    });
  });
}

// Marketplace Functions
export async function listNFT(nftContract, tokenId, price, expiry) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(tokenId),
    uintCV(price),
    uintCV(expiry),
  ];

  return callContract(MARKETPLACE_CONTRACT, 'list-nft', functionArgs);
}

export async function buyNFT(nftContract, listingId, price) {
  const userAddress = getAddress();
  if (!userAddress) throw new Error('Wallet not connected');
  
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

  return callContract(MARKETPLACE_CONTRACT, 'buy-nft', functionArgs, postConditions);
}

export async function unlistNFT(nftContract, listingId) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(listingId),
  ];

  return callContract(MARKETPLACE_CONTRACT, 'unlist-nft', functionArgs);
}

export async function updatePrice(listingId, newPrice) {
  const functionArgs = [uintCV(listingId), uintCV(newPrice)];
  return callContract(MARKETPLACE_CONTRACT, 'update-price', functionArgs);
}

// Auction Functions
export async function createAuction(nftContract, tokenId, reservePrice, duration) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(tokenId),
    uintCV(reservePrice),
    uintCV(duration),
  ];

  return callContract(AUCTION_CONTRACT, 'create-auction', functionArgs);
}

export async function placeBid(auctionId, bidAmount) {
  const userAddress = getAddress();
  if (!userAddress) throw new Error('Wallet not connected');
  
  const postConditions = [
    makeStandardSTXPostCondition(
      userAddress,
      FungibleConditionCode.Equal,
      bidAmount
    ),
  ];

  const functionArgs = [uintCV(auctionId), uintCV(bidAmount)];
  return callContract(AUCTION_CONTRACT, 'place-bid', functionArgs, postConditions);
}

// Offers Functions
export async function makeOffer(nftContract, tokenId, amount, expiry) {
  const userAddress = getAddress();
  if (!userAddress) throw new Error('Wallet not connected');
  
  const postConditions = [
    makeStandardSTXPostCondition(
      userAddress,
      FungibleConditionCode.Equal,
      amount
    ),
  ];

  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(tokenId),
    uintCV(amount),
    uintCV(expiry),
  ];

  return callContract(OFFERS_CONTRACT, 'make-offer', functionArgs, postConditions);
}

export async function acceptOffer(nftContract, offerId) {
  const functionArgs = [
    contractPrincipalCV(CONTRACT_ADDRESS, nftContract),
    uintCV(offerId),
  ];

  return callContract(OFFERS_CONTRACT, 'accept-offer', functionArgs);
}
