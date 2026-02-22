# 20 NFT Contracts Deployment Summary

**Deployment Date:** February 22, 2026  
**Network:** Stacks Mainnet  
**Deployer Address:** SP1EPS1JHVHZ3MZRVY3381PDJJJ8PAFTDHMWAGK8P

## Successfully Deployed Contracts (20 Total)

| # | Contract Name | Transaction ID |
|---|---------------|----------------|
| 1 | mekaverse | c26ad1db5d02518cc0dbeb4fa23efad0f857607977115d20d9f72649b372f39c |
| 2 | hape-prime | d9120ce78da3d7b575357a71ee42d1243e458a9d45cfd3c8b9cc1267a51d89b4 |
| 3 | valhalla | 58fe506636acd1876cd20066d9e40929bfba88e3e90dde9a32c7d28cae8a3521 |
| 4 | parallel-alpha | d926c6acaf09d6d91075424838bb96724fca60a7ebc80e1764d60e6897f4475c |
| 5 | gutter-cat-gang | 1b7004d9182b40bb8f4c8481add279f44a47e088ad88013046e562d2709495e3 |
| 6 | mnlth | 854120e485026e4177ba5af53968fa644998534d4024dd5c7f01a811f3f1df00 |
| 7 | veefriends | b98afc2ca2c8b6870c3899aca6520ec13bc8c4ceb0ef6c440130d4fcb7fc985d |
| 8 | creature-world | 43760b8902b31e9290adc087660d9a49449c01572752b89ada2b265d3f022a29 |
| 9 | on1-force | f71e8d6f57d3496f872f80be5e3f46c3637ffcaa55483527be4940116eb0528f |
| 10 | tenktf | 15e806e647695870aee544fa610efa5039957e00c1d4f4e0cf8c39cbd44863a9 |
| 11 | moonrunners | a825ddcbb7db714af97e74ec5eca46e63980dd0ebf9b082633152a68b6c7f890 |
| 12 | rumble-kong-league | 43d90259080d87aa5dc4f42e4adf5cb9171d44637858203e25ede61abf74fef6 |
| 13 | prime-ape-planet | 7a23dea5584957904cc4aa4ad803428a4b672e3dc3d45d023c562935896282be |
| 14 | bakc | e631f6df5b24f0cdb8dda13b8c5f7138d510c5d6dad97382c90cebfd457a133d |
| 15 | murakami-flowers | 05212d3272df6448dc2a235215353ea274be14559e7728d0d39c0da95eb7c13a |
| 16 | karafuru | da088df7d4cfbeb5fe62429a266a5de0388b299941fef4b2c6e97b1f332d168a |
| 17 | nft-worlds | 9a56eb643d11e313e926c28f48507a6d4af5df24606d36eaa39ba476c6f8286a |
| 18 | digidaigaku | 117999ef263b110468690952eee8ea3736fa094b96b2b36f580a6a6e31b198a6 |
| 19 | fluf-world | b2b4d9a25317844547c2be98994229b5b3e5d5c1607539b7b850f0caca7806f4 |
| 20 | deadfellaz | e0e6e067a979ec376cb1a322fd80db8b0b8b6d7068f2f9007e8a298264f6b0ab |

## Security Notes

✅ **Private Key Security:**
- Private key stored in `.env` file (not committed to git)
- `.env` is properly listed in `.gitignore`
- File permissions are appropriate (rw-rw-r--)
- No private keys exposed in deployment logs or scripts

✅ **Deployment Configuration:**
- Network: Stacks Mainnet
- Fee per transaction: 20,000 microSTX
- Clarity Version: 2
- All transactions successfully broadcast and confirmed

## Verification

To verify any contract deployment:
```bash
curl https://api.mainnet.hiro.so/extended/v1/tx/<transaction_id>
```

Or view in explorer:
```
https://explorer.stacks.co/txid/<transaction_id>
```
