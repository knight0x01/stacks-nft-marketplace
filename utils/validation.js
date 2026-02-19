export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return /^S[MP][0-9A-Z]{38,41}$/.test(address);
};

export const validatePrice = (price) => {
  const num = BigInt(price);
  return num > 0n;
};

export const validateTokenId = (tokenId) => {
  const num = Number(tokenId);
  return Number.isInteger(num) && num >= 0;
};

export const validateEnv = (required = []) => {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};
