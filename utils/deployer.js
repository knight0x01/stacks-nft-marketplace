import { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { readFileSync } from 'fs';

export class ContractDeployer {
  constructor(privateKey, network) {
    this.privateKey = privateKey;
    this.network = network;
  }

  async deploy(contractName, filePath, nonce, fee = 20000n) {
    const codeBody = readFileSync(filePath, 'utf8');
    
    const txOptions = {
      contractName,
      codeBody,
      senderKey: this.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      fee,
      nonce,
      postConditionMode: PostConditionMode.Allow,
      clarityVersion: 2,
    };

    const transaction = await makeContractDeploy(txOptions);
    return await broadcastTransaction(transaction, this.network);
  }

  async deployBatch(contracts, startNonce, delayMs = 100) {
    const results = [];
    let currentNonce = startNonce;

    for (const { name, path } of contracts) {
      try {
        const result = await this.deploy(name, path, currentNonce);
        results.push({ name, success: !result.error, txid: result.txid || result.error });
        currentNonce++;
        if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
      } catch (error) {
        results.push({ name, success: false, error: error.message });
      }
    }

    return results;
  }
}
