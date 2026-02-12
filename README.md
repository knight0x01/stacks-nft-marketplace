# Stacks NFT Marketplace

A decentralized NFT marketplace built on the Stacks blockchain with support for listings, auctions, escrow, and royalties.

## Features

- **NFT Marketplace**: Create and manage NFT listings with platform fees
- **Auction System**: English auction mechanism for competitive bidding
- **Secure Escrow**: Safe peer-to-peer NFT trades
- **Royalty Management**: Automatic royalty payments to creators
- **SIP-009 Compliant**: Standard NFT trait implementation

## Smart Contracts

- `nft-marketplace.clar` - Core marketplace for buying/selling NFTs
- `nft-auction.clar` - English auction system
- `nft-escrow.clar` - Secure escrow for trades
- `nft-royalty.clar` - Creator royalty management
- `example-nft.clar` - Sample NFT collection
- `sip-009-nft-trait.clar` - Standard NFT trait

## Installation

```bash
npm install
```

## Testing

```bash
npm test
```

## Deployment

1. Create a `.env` file with your private key:
```
PRIVATE_KEY=your_private_key_here
```

2. Deploy contracts:
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

## License

MIT
