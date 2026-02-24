import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode } from '@stacks/transactions';

export class ContractInteractor {
  constructor(privateKey, network, contractAddress) {
    this.privateKey = privateKey;
    this.network = network;
    this.contractAddress = contractAddress;
  }

  async call(contractName, functionName, functionArgs, nonce, fee = 10000n) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName,
      functionName,
      functionArgs,
      senderKey: this.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      fee,
      nonce,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async batchCall(calls, startNonce, delayMs = 100) {
    const results = [];
    let currentNonce = startNonce;

    for (const { contract, function: fn, args } of calls) {
      try {
        const result = await this.call(contract, fn, args, currentNonce);
        results.push({ contract, function: fn, success: !result.error, txid: result.txid || result.error });
        currentNonce++;
        if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
      } catch (error) {
        results.push({ contract, function: fn, success: false, error: error.message });
      }
    }

    return results;
  }
}
