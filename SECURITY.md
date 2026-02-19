# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email security@example.com. Do not open public issues for security vulnerabilities.

## Security Best Practices

### Private Key Management
- Never commit private keys to version control
- Store keys in `.env` file (already in `.gitignore`)
- Use hardware wallets for production deployments
- Rotate keys regularly

### Contract Security
- All contracts include pause mechanisms
- Platform fees capped at 10%
- Input validation on all public functions
- Reentrancy protection via check-effects-interactions pattern

### Deployment Security
- Test on testnet before mainnet deployment
- Verify contract addresses after deployment
- Use multi-sig wallets for contract ownership
- Monitor contract activity regularly

## Audit Status

This project has not been professionally audited. Use at your own risk.

## Known Limitations

- Price history limited by map storage
- No automatic refunds for failed transactions
- Auction extensions may be gamed near end time
