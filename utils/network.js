import { StacksMainnet, StacksTestnet } from '@stacks/network';

export function getNetwork(networkType = 'mainnet') {
  return networkType === 'testnet' ? new StacksTestnet() : new StacksMainnet();
}

export async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

export async function getNonce(address, network = 'mainnet') {
  const baseUrl = network === 'testnet' 
    ? 'https://api.testnet.hiro.so' 
    : 'https://api.mainnet.hiro.so';
  const data = await fetchWithRetry(`${baseUrl}/v2/accounts/${address}?proof=0`);
  return BigInt(data.nonce);
}
