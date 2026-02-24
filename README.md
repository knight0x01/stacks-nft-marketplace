# Stacks NFT Marketplace

A decentralized NFT marketplace built on the Stacks blockchain with support for listings, auctions, escrow, and royalties.

## Features

- **NFT Marketplace**: Create and manage NFT listings with platform fees
- **Auction System**: English auction mechanism for competitive bidding
- **Secure Escrow**: Safe peer-to-peer NFT trades
- **Royalty Management**: Automatic royalty payments to creators
- **Offer System**: Make and accept offers on NFTs
- **Collection Verification**: Verify authentic NFT collections
- **SIP-009 Compliant**: Standard NFT trait implementation

## Smart Contracts

### Core Contracts
- `nft-marketplace.clar` - Core marketplace for buying/selling NFTs
- `nft-auction.clar` - English auction system
- `nft-escrow.clar` - Secure escrow for trades
- `nft-royalty.clar` - Creator royalty management
- `nft-offers.clar` - Offer system for NFTs
- `collection-verification.clar` - Collection verification
- `nft-bundle.clar` - Bundle multiple NFTs
- `nft-whitelist.clar` - Whitelist management

### Example Contracts
- `example-nft.clar` - Sample NFT collection
- `sip-009-nft-trait.clar` - Standard NFT trait

## Installation

```bash
npm install
```

## Quick Start

1. Configure environment:
```bash
cp .env.template .env
# Add your PRIVATE_KEY and configuration
```

2. Deploy core contracts:
```bash
npm run deploy:core
```

3. Verify deployment:
```bash
npm run check:deployed
```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## Testing

```bash
npm test
```

## Deployment

Deploy contracts to mainnet:
```bash
npm run deploy
```

## Usage

### Mint an NFT
```bash
node scripts/mint-nft.js <recipient-address>
```

### List an NFT
```bash
node scripts/list-nft.js <nft-contract> <token-id> <price>
```

### Buy an NFT
```bash
node scripts/buy-nft.js <listing-id>
```

### Batch Operations
```bash
node scripts/bulk-list.js
node scripts/batch-mint.js
```

### Analytics
```bash
node scripts/marketplace-stats.js
node scripts/collection-stats.js
```

## Security

- Private keys are stored in `.env` (never committed to git)
- All scripts validate inputs before transactions
- Contracts include pause mechanisms for emergencies
- Comprehensive error handling throughout

## Project Structure

```
├── contracts/          # Clarity smart contracts
│   ├── Core contracts (marketplace, auction, escrow, etc.)
│   └── NFT collections (90+ popular collections)
├── scripts/           # Deployment and interaction scripts
├── utils/             # Reusable utilities
│   ├── deployer.js    # Contract deployment
│   ├── interactor.js  # Contract interactions
│   ├── minter.js      # NFT minting
│   ├── marketplace.js # Marketplace operations
│   ├── network.js     # Network utilities
│   └── transaction.js # Transaction management
├── config/            # Configuration files
│   ├── contracts.js   # Contract registry
│   ├── env.js         # Environment config
│   └── constants.js   # App constants
├── docs/              # Documentation
│   ├── API.md         # API reference
│   └── DEPLOYMENT.md  # Deployment guide
├── tests/             # Contract tests
└── frontend/          # Web interface
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT
