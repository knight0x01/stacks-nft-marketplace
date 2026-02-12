import { getAddressFromPrivateKey } from '@stacks/transactions';

export async function getNonce(address, network) {
  const response = await fetch(`${network}/v2/accounts/${address}?proof=0`);
  const data = await response.json();
  return BigInt(data.nonce);
}

export async function getBalance(address, network) {
  const response = await fetch(`${network}/v2/accounts/${address}?proof=0`);
  const data = await response.json();
  return BigInt(data.balance);
}

export function getAddressFromKey(privateKey, networkType = 'mainnet') {
  return getAddressFromPrivateKey(privateKey, networkType);
}

export function microStxToStx(microStx) {
  return Number(microStx) / 1000000;
}

export function stxToMicroStx(stx) {
  return BigInt(Math.floor(stx * 1000000));
}

export async function waitForTransaction(txid, network, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${network}/extended/v1/tx/${txid}`);
    const data = await response.json();
    
    if (data.tx_status === 'success') {
      return { success: true, data };
    } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
      return { success: false, data };
    }
    
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
  }
  
  return { success: false, error: 'Timeout waiting for transaction' };
}
