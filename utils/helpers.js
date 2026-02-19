import { getAddressFromPrivateKey } from '@stacks/transactions';

export const getNonce = async (address, network) => {
  const response = await fetch(`${network}/v2/accounts/${address}?proof=0`);
  const data = await response.json();
  return BigInt(data.nonce);
};

export const getBalance = async (address, network) => {
  const response = await fetch(`${network}/v2/accounts/${address}?proof=0`);
  const data = await response.json();
  return BigInt(data.balance);
};

export const getAddressFromKey = (privateKey, networkType = 'mainnet') => {
  return getAddressFromPrivateKey(privateKey, networkType);
};

export const microStxToStx = (microStx) => Number(microStx) / 1_000_000;

export const stxToMicroStx = (stx) => BigInt(Math.floor(stx * 1_000_000));

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      await sleep(delay);
    }
  }
};

export const waitForTransaction = async (txid, network, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${network}/extended/v1/tx/${txid}`);
    const data = await response.json();
    
    if (data.tx_status === 'success') return { success: true, data };
    if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
      return { success: false, data };
    }
    
    await sleep(10000);
  }
  
  return { success: false, error: 'Timeout waiting for transaction' };
};
