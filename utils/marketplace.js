import { contractPrincipalCV, uintCV } from '@stacks/transactions';
import { ContractInteractor } from './interactor.js';

export class MarketplaceLister {
  constructor(privateKey, network, contractAddress) {
    this.interactor = new ContractInteractor(privateKey, network, contractAddress);
  }

  async listNFT(nftContract, tokenId, price, nonce) {
    const args = [
      contractPrincipalCV(this.interactor.contractAddress, nftContract),
      uintCV(tokenId),
      uintCV(price),
    ];
    return await this.interactor.call('nft-marketplace', 'list-nft', args, nonce);
  }

  async unlistNFT(listingId, nonce) {
    const args = [uintCV(listingId)];
    return await this.interactor.call('nft-marketplace', 'unlist-nft', args, nonce);
  }

  async buyNFT(listingId, nonce) {
    const args = [uintCV(listingId)];
    return await this.interactor.call('nft-marketplace', 'buy-nft', args, nonce);
  }

  async batchList(listings, startNonce) {
    const calls = listings.map(({ contract, tokenId, price }) => ({
      contract: 'nft-marketplace',
      function: 'list-nft',
      args: [
        contractPrincipalCV(this.interactor.contractAddress, contract),
        uintCV(tokenId),
        uintCV(price),
      ],
    }));

    return await this.interactor.batchCall(calls, startNonce);
  }
}
