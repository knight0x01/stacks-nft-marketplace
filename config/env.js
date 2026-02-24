import 'dotenv/config';

export const config = {
  privateKey: process.env.PRIVATE_KEY,
  network: process.env.NETWORK || 'mainnet',
  contractAddress: process.env.CONTRACT_ADDRESS,
  senderAddress: process.env.SENDER_ADDRESS,
};

export function validateConfig(required = ['privateKey']) {
  const missing = required.filter(key => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required config: ${missing.join(', ')}`);
  }
}

export function isMainnet() {
  return config.network === 'mainnet';
}

export function isTestnet() {
  return config.network === 'testnet';
}
