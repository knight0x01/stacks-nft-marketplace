# Stacks NFT Marketplace Frontend

Frontend application for the Stacks NFT Marketplace using @stacks/connect and @stacks/transactions.

## Features

- Wallet connection with Stacks Connect
- Browse NFT listings
- Buy and sell NFTs
- Auction system
- Secure (no private keys in frontend)

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Security

- Uses @stacks/connect for wallet authentication
- No private keys stored or handled in frontend
- All transactions signed through user's wallet
