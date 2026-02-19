export const log = {
  info: (msg, data = {}) => console.log(`ℹ️  ${msg}`, data),
  success: (msg, data = {}) => console.log(`✅ ${msg}`, data),
  error: (msg, data = {}) => console.error(`❌ ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`⚠️  ${msg}`, data),
  debug: (msg, data = {}) => process.env.DEBUG && console.log(`🔍 ${msg}`, data),
};

export const formatTxId = (txid) => `${txid.slice(0, 8)}...${txid.slice(-8)}`;

export const logTransaction = (action, txid, details = {}) => {
  log.success(`${action}: ${formatTxId(txid)}`, details);
};
