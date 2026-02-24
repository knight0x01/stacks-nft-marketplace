# Testing Guide

## Running Tests

```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Test Structure

Tests are located in `tests/` directory:

- `nft-marketplace.test.ts` - Marketplace contract tests
- `nft-auction.test.ts` - Auction system tests
- `nft-escrow.test.ts` - Escrow contract tests
- `example-nft.test.ts` - NFT implementation tests
- `comprehensive.test.ts` - Integration tests

## Writing Tests

Example test structure:

```typescript
import { describe, expect, it } from 'vitest';

describe('nft-marketplace', () => {
  it('should list NFT', () => {
    // Test implementation
  });
  
  it('should buy NFT', () => {
    // Test implementation
  });
});
```

## Test Coverage

Run tests with coverage:

```bash
npm test -- --coverage
```

## Integration Testing

Test against testnet:

1. Set network to testnet:
```env
NETWORK=testnet
```

2. Deploy contracts:
```bash
npm run deploy:core
```

3. Run integration tests:
```bash
npm run test:integration
```

## Manual Testing

### Test Marketplace Listing

```bash
npm run mint -- <recipient>
npm run list -- <contract> <token-id> <price>
```

### Test Purchase

```bash
npm run buy -- <listing-id>
```

### Check Stats

```bash
npm run stats
```
