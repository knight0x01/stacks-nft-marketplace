export function validateAddress(address) {
  return /^S[PM][0-9A-Z]{38,40}$/.test(address);
}

export function validateAmount(amount) {
  return !isNaN(amount) && amount > 0;
}

export function validateTokenId(tokenId) {
  return Number.isInteger(tokenId) && tokenId >= 0;
}
