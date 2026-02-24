import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import { getNetwork, getNonce } from '../utils/network.js';
import { ContractDeployer } from '../utils/deployer.js';
import { getCoreContracts } from '../config/contracts.js';
import 'dotenv/config';

const privateKey = process.env.PRIVATE_KEY;
const networkType = process.env.NETWORK || 'mainnet';

if (!privateKey) throw new Error('PRIVATE_KEY required');

const network = getNetwork(networkType);
const address = getAddressFromPrivateKey(
  privateKey, 
  networkType === 'testnet' ? TransactionVersion.Testnet : TransactionVersion.Mainnet
);

console.log(`🚀 Deploying core contracts to ${networkType}`);
console.log(`📍 Address: ${address}\n`);

async function main() {
  const deployer = new ContractDeployer(privateKey, network);
  const nonce = await getNonce(address, networkType);
  
  console.log(`Starting nonce: ${nonce}\n`);
  
  const contracts = getCoreContracts();
  const results = await deployer.deployBatch(contracts, nonce, 200);
  
  console.log('\n📊 Deployment Results:');
  results.forEach(({ name, success, txid, error }) => {
    console.log(`${success ? '✅' : '❌'} ${name}: ${txid || error}`);
  });
  
  const successful = results.filter(r => r.success).length;
  console.log(`\n✨ ${successful}/${results.length} contracts deployed`);
}

main().catch(console.error);
