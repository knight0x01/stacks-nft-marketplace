# Frontend - Stacks NFT Marketplace

Modern web interface for the Stacks NFT Marketplace using @stacks/connect and @stacks/transactions.

## Features

- ✅ Wallet connection with Hiro Wallet
- ✅ List NFTs for sale
- ✅ Buy NFTs with post-conditions
- ✅ Create auctions
- ✅ Place bids
- ✅ Make & accept offers
- ✅ Transaction notifications with explorer links
- ✅ Form validation
- ✅ Loading states
- ✅ Responsive design

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Technologies

- **@stacks/connect** v7.10.2 - Wallet connection
- **@stacks/transactions** v6.17.0 - Transaction building
- **@stacks/network** v6.17.0 - Network configuration
- **Vite** v5.0.0 - Build tool

## Contract Addresses

Mainnet:
- Marketplace: `SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P.nft-marketplace-v2`
- Auction: `SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P.nft-auction-v2`
- Offers: `SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P.nft-offers-v2`

## Usage

1. **Connect Wallet** - Click "Connect Wallet" and approve in Hiro Wallet
2. **List NFT** - Enter contract name, token ID, price, and expiry
3. **Buy NFT** - Enter contract name, listing ID, and price
4. **Create Auction** - Enter contract name, token ID, reserve price, and duration
5. **Place Bid** - Enter auction ID and bid amount
6. **Make Offer** - Enter contract name, token ID, offer amount, and expiry

## File Structure

```
frontend/
├── src/
│   ├── app.js         # Main application logic
│   ├── wallet.js      # Wallet connection
│   ├── contracts.js   # Contract interactions
│   └── config.js      # Configuration
├── styles/
│   └── app.css        # Styling
├── index.html         # HTML structure
└── package.json       # Dependencies
```

## Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to any static hosting service.
