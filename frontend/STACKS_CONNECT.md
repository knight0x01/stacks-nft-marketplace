# Stacks Connect Integration

This frontend uses the official Stacks Connect API as documented at https://docs.stacks.co/stacks-connect/

## API Methods Used

### Wallet Connection
- `connect()` - Connect and authenticate wallet
- `disconnect()` - Disconnect wallet
- `isConnected()` - Check connection status
- `getLocalStorage()` - Get persisted user data

### Account Management
- `request('stx_getAccounts')` - Get full account details

### Transactions
- `request('stx_transferStx', {...})` - Transfer STX tokens
- `request('stx_callContract', {...})` - Call contract functions

### Clarity Value Construction
- `Cl.uint()` - Unsigned integer
- `Cl.contractPrincipal()` - Contract principal
- `Cl.standardPrincipal()` - Standard principal
- `Cl.stringAscii()` - ASCII string

## Features

✅ Modern connect() API (no showConnect)
✅ Automatic wallet state persistence
✅ Network configuration (mainnet/testnet/devnet)
✅ STX and BTC address access
✅ Transaction broadcasting with request()
✅ Clarity value helpers with Cl
✅ Error handling and validation

## Migration from Old API

**Before:**
```javascript
showConnect({ onFinish, onCancel, userSession })
```

**After:**
```javascript
const response = await connect()
```

**Before:**
```javascript
openContractCall({ functionArgs: [uintCV(123)] })
```

**After:**
```javascript
request('stx_callContract', { functionArgs: [Cl.uint(123)] })
```
