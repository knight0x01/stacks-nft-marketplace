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

log.section('Deploying Market Engine');
log.info(`Network: ${config.network}`);
log.info(`Address: ${address}`);

async function main() {
  const deployer = new ContractDeployer(config.privateKey, network);
  const nonce = await getNonce(address, config.network);
  
  log.info(`Starting nonce: ${nonce}\n`);
  
  const contract = {
    name: 'market-engine',
    path: 'contracts/market-engine.clar'
  };
  
  log.info(`Deploying ${contract.name}...`);
  
  const results = await deployer.deployBatch([contract], nonce, 0);
  
  log.section('Deployment Result');
  
  const result = results[0];
  if (result.success) {
    log.success(`${result.name} deployed!`);
    log.info(`TX ID: ${result.txid}`);
    log.info(`Contract: ${address}.${result.name}`);
    log.info(`Explorer: https://explorer.hiro.so/txid/${result.txid}?chain=${config.network}`);
  } else {
    log.error(`${result.name} failed: ${result.error || result.txid}`);
  }
}

main().catch(err => {
  log.error('Deployment failed:', err);
  process.exit(1);
});
