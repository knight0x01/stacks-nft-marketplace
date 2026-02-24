# Utilities

Core utilities for interacting with Stacks NFT Marketplace contracts.

## Modules

### Network (`network.js`)
- `getNetwork(type)` - Get Stacks network instance
- `fetchWithRetry(url, retries, delay)` - Fetch with automatic retry
- `getNonce(address, network)` - Get current nonce for address

### Deployer (`deployer.js`)
- `ContractDeployer` - Deploy contracts individually or in batches
  - `deploy(name, path, nonce, fee)` - Deploy single contract
  - `deployBatch(contracts, startNonce, delay)` - Deploy multiple contracts

### Interactor (`interactor.js`)
- `ContractInteractor` - Call contract functions
  - `call(contract, function, args, nonce, fee)` - Single contract call
  - `batchCall(calls, startNonce, delay)` - Multiple contract calls

### Transaction (`transaction.js`)
- `getTxStatus(txid, network)` - Get transaction status
- `waitForTx(txid, network, maxAttempts, delay)` - Wait for transaction confirmation

### Minter (`minter.js`)
- `NFTMinter` - Mint NFTs
  - `mint(contract, recipient, tokenId, nonce)` - Mint single NFT
  - `batchMint(contract, recipients, startTokenId, startNonce)` - Mint multiple NFTs

### Marketplace (`marketplace.js`)
- `MarketplaceLister` - Manage marketplace listings
  - `listNFT(contract, tokenId, price, nonce)` - List NFT for sale
  - `unlistNFT(listingId, nonce)` - Remove listing
  - `buyNFT(listingId, nonce)` - Purchase NFT
  - `batchList(listings, startNonce)` - List multiple NFTs

### Logger (`logger.js`)
- `log.info(msg, data)` - Info message
- `log.success(msg, data)` - Success message
- `log.error(msg, data)` - Error message
- `log.warn(msg, data)` - Warning message
- `log.section(msg)` - Section header
- `formatTxId(txid)` - Format transaction ID
- `logTransaction(action, txid, details)` - Log transaction

## Usage Example

```javascript
import { ContractDeployer } from './utils/deployer.js';
import { getNetwork, getNonce } from './utils/network.js';
import { log } from './utils/logger.js';

const network = getNetwork('mainnet');
const deployer = new ContractDeployer(privateKey, network);
const nonce = await getNonce(address, 'mainnet');

const result = await deployer.deploy('my-contract', 'contracts/my-contract.clar', nonce);
log.success('Deployed', { txid: result.txid });
```
