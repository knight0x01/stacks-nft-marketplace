import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import { getNetwork, getNonce } from '../utils/network.js';
import { ContractDeployer } from '../utils/deployer.js';
import { config, validateConfig } from '../config/env.js';
import { log } from '../utils/logger.js';

validateConfig(['privateKey']);

const network = getNetwork(config.network);
const address = getAddressFromPrivateKey(
  config.privateKey, 
  config.network === 'testnet' ? TransactionVersion.Testnet : TransactionVersion.Mainnet
);

log.section('Deploying V2 Contracts');
log.info(`Network: ${config.network}`);
log.info(`Address: ${address}`);

async function main() {
  const deployer = new ContractDeployer(config.privateKey, network);
  const nonce = await getNonce(address, config.network);
  
  log.info(`Starting nonce: ${nonce}\n`);
  
  const contracts = [
    { name: 'nft-marketplace-v2', path: 'contracts/nft-marketplace-v2.clar' },
    { name: 'nft-auction-v2', path: 'contracts/nft-auction-v2.clar' },
    { name: 'nft-offers-v2', path: 'contracts/nft-offers-v2.clar' },
  ];
  
  const results = await deployer.deployBatch(contracts, nonce, 500);
  
  log.section('Deployment Results');
  results.forEach(({ name, success, txid, error }) => {
    if (success) {
      log.success(`${name}: ${txid}`);
    } else {
      log.error(`${name}: ${error || txid}`);
    }
  });
  
  const successful = results.filter(r => r.success).length;
  log.info(`\n✨ ${successful}/${results.length} contracts deployed`);
  
  if (successful > 0) {
    log.section('Contract Addresses');
    results.filter(r => r.success).forEach(({ name, txid }) => {
      log.info(`${name}: ${address}.${name}`);
    });
  }
}

main().catch(err => {
  log.error('Deployment failed:', err);
  process.exit(1);
});
