export function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatSTX(amount) {
  return (amount / 1000000).toFixed(6);
}

export function parseSTX(amount) {
  return Math.floor(amount * 1000000);
}
