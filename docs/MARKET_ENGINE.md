# Market Engine

**Unified NFT Marketplace System**

## Deployed Contract

- **Address**: `SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P.market-engine`
- **TX ID**: `41c1d74381a3dd0cb65602d0a571cce8f2aca7993606fa407b08c0f308ff8bba`
- **Network**: Mainnet
- **Explorer**: https://explorer.hiro.so/txid/41c1d74381a3dd0cb65602d0a571cce8f2aca7993606fa407b08c0f308ff8bba?chain=mainnet

## Features

### 🏪 Marketplace
- List NFTs with expiry
- Buy NFTs with automatic royalty distribution
- Cancel listings
- Escrow mechanism (contract holds NFT)

### ⚡ Auctions
- Create time-bound auctions (24h-30d)
- Place bids with automatic refunds
- Finalize auctions
- Reserve price support

### 💎 Offers
- Make offers on any NFT
- Accept offers
- Funds escrowed in contract
- Expiry management

### 👑 Royalties
- Set creator royalties (up to 10%)
- Automatic distribution on sales
- Per-NFT royalty configuration

## Configuration

- **Platform Fee**: 2.5%
- **Minimum Price**: 1 STX
- **Min Auction Duration**: 144 blocks (~24h)
- **Max Auction Duration**: 4320 blocks (~30d)
- **Max Royalty**: 10%

## Functions

### Marketplace

```clarity
(list-nft (nft-contract <nft-trait>) (token-id uint) (price uint) (expiry uint))
(buy-nft (nft-contract <nft-trait>) (listing-id uint))
(cancel-listing (nft-contract <nft-trait>) (listing-id uint))
```

### Auctions

```clarity
(create-auction (nft-contract <nft-trait>) (token-id uint) (reserve uint) (duration uint))
(place-bid (auction-id uint) (amount uint))
(finalize-auction (nft-contract <nft-trait>) (auction-id uint))
```

### Offers

```clarity
(make-offer (nft-contract principal) (token-id uint) (amount uint) (expiry uint))
(accept-offer (nft-contract <nft-trait>) (offer-id uint))
```

### Royalties

```clarity
(set-royalty (nft-contract principal) (token-id uint) (creator principal) (percentage uint))
```

## Read-Only Functions

```clarity
(get-listing (id uint))
(get-auction (id uint))
(get-offer (id uint))
(get-royalty (nft-contract principal) (token-id uint))
```

## Security Features

✅ Escrow mechanism - Contract holds assets during transactions
✅ Expiry validation - Prevents stale listings/offers
✅ Royalty enforcement - Automatic creator payments
✅ Pause mechanism - Emergency circuit breaker
✅ Access control - Owner-only admin functions

## Usage Example

### List an NFT

```javascript
import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';

await request('stx_callContract', {
  contractAddress: 'SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P',
  contractName: 'market-engine',
  functionName: 'list-nft',
  functionArgs: [
    Cl.contractPrincipal(CONTRACT_ADDRESS, 'my-nft'),
    Cl.uint(1),
    Cl.uint(10000000), // 10 STX
    Cl.uint(150000), // expiry block
  ],
  network: 'mainnet',
});
```

### Buy an NFT

```javascript
await request('stx_callContract', {
  contractAddress: 'SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P',
  contractName: 'market-engine',
  functionName: 'buy-nft',
  functionArgs: [
    Cl.contractPrincipal(CONTRACT_ADDRESS, 'my-nft'),
    Cl.uint(1), // listing-id
  ],
  network: 'mainnet',
});
```

## Payment Flow

1. **Buyer pays full price**
2. **Platform fee deducted** (2.5%)
3. **Royalty paid to creator** (if set)
4. **Remaining amount to seller**

Example: 10 STX sale with 5% royalty
- Platform fee: 0.25 STX
- Creator royalty: 0.5 STX
- Seller receives: 9.25 STX

## Admin Functions

```clarity
(set-treasury (new-treasury principal))
(toggle-pause)
```

---

*Deployed: February 24, 2026*
*Production Ready: ✅*
