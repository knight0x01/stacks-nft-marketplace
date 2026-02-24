# Deployment Guide

## Prerequisites

- Node.js 18+
- Stacks wallet with STX for gas fees
- Private key exported

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.template .env
# Edit .env with your credentials
```

3. Verify configuration:
```bash
node -e "import('./config/env.js').then(m => m.validateConfig())"
```

## Deployment Strategies

### Core Contracts Only

Deploy marketplace infrastructure:

```bash
npm run deploy:core
```

Deploys:
- SIP-009 trait
- NFT marketplace
- Auction system
- Escrow
- Royalty management
- Offers system
- Collection verification

### Full Deployment

Deploy all contracts including NFT collections:

```bash
npm run deploy
```

### Batched Deployment

For large deployments to avoid mempool limits:

```bash
npm run deploy:batched
```

## Verification

Check deployment status:

```bash
npm run check:deployed
```

## Post-Deployment

1. Verify contracts on explorer
2. Test core functions
3. Update frontend configuration
4. Document contract addresses

## Troubleshooting

### TooMuchChaining Error

Wait 10-15 minutes for mempool to clear, then retry.

### ContractAlreadyExists

Contract is already deployed. Use `check:deployed` to verify.

### Insufficient Funds

Ensure wallet has enough STX for deployment fees (~0.02 STX per contract).

## Network Configuration

### Mainnet
```env
NETWORK=mainnet
```

### Testnet
```env
NETWORK=testnet
```
