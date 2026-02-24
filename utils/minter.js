import { principalCV, uintCV } from '@stacks/transactions';
import { ContractInteractor } from './interactor.js';

export class NFTMinter {
  constructor(privateKey, network, contractAddress) {
    this.interactor = new ContractInteractor(privateKey, network, contractAddress);
  }

  async mint(contractName, recipient, tokenId, nonce) {
    const args = [principalCV(recipient), uintCV(tokenId)];
    return await this.interactor.call(contractName, 'mint', args, nonce);
  }

  async batchMint(contractName, recipients, startTokenId, startNonce) {
    const calls = recipients.map((recipient, i) => ({
      contract: contractName,
      function: 'mint',
      args: [principalCV(recipient), uintCV(startTokenId + i)],
    }));

    return await this.interactor.batchCall(calls, startNonce);
  }
}
