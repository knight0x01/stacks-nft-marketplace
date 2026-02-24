# API Reference

## Contract Functions

### NFT Marketplace

#### list-nft
List an NFT for sale on the marketplace.

**Parameters:**
- `nft-contract` (principal) - NFT contract address
- `token-id` (uint) - Token ID to list
- `price` (uint) - Price in microSTX

**Returns:** `(response uint uint)`

#### buy-nft
Purchase a listed NFT.

**Parameters:**
- `listing-id` (uint) - Marketplace listing ID

**Returns:** `(response bool uint)`

#### unlist-nft
Remove an NFT listing.

**Parameters:**
- `listing-id` (uint) - Marketplace listing ID

**Returns:** `(response bool uint)`

### NFT Auction

#### create-auction
Create an auction for an NFT.

**Parameters:**
- `nft-contract` (principal) - NFT contract address
- `token-id` (uint) - Token ID
- `starting-bid` (uint) - Minimum bid in microSTX
- `duration` (uint) - Auction duration in blocks

**Returns:** `(response uint uint)`

#### place-bid
Place a bid on an active auction.

**Parameters:**
- `auction-id` (uint) - Auction ID
- `bid-amount` (uint) - Bid amount in microSTX

**Returns:** `(response bool uint)`

#### finalize-auction
Finalize an ended auction.

**Parameters:**
- `auction-id` (uint) - Auction ID

**Returns:** `(response bool uint)`

### NFT Escrow

#### create-escrow
Create an escrow for P2P NFT trade.

**Parameters:**
- `nft-contract` (principal) - NFT contract address
- `token-id` (uint) - Token ID
- `recipient` (principal) - Trade recipient
- `price` (uint) - Trade price in microSTX

**Returns:** `(response uint uint)`

#### complete-escrow
Complete an escrow trade.

**Parameters:**
- `escrow-id` (uint) - Escrow ID

**Returns:** `(response bool uint)`

#### cancel-escrow
Cancel an escrow trade.

**Parameters:**
- `escrow-id` (uint) - Escrow ID

**Returns:** `(response bool uint)`

### NFT Offers

#### make-offer
Make an offer on an NFT.

**Parameters:**
- `nft-contract` (principal) - NFT contract address
- `token-id` (uint) - Token ID
- `offer-amount` (uint) - Offer amount in microSTX

**Returns:** `(response uint uint)`

#### accept-offer
Accept an offer on your NFT.

**Parameters:**
- `offer-id` (uint) - Offer ID

**Returns:** `(response bool uint)`

#### cancel-offer
Cancel your offer.

**Parameters:**
- `offer-id` (uint) - Offer ID

**Returns:** `(response bool uint)`

## Error Codes

- `u100` - Unauthorized
- `u101` - Not found
- `u102` - Already exists
- `u103` - Invalid parameters
- `u104` - Insufficient funds
- `u105` - Auction ended
- `u106` - Auction active
- `u107` - Bid too low
