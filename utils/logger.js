const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

export const log = {
  info: (msg, data = {}) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`, data),
  success: (msg, data = {}) => console.log(`${colors.green}✓${colors.reset} ${msg}`, data),
  error: (msg, data = {}) => console.error(`${colors.red}✖${colors.reset} ${msg}`, data),
  warn: (msg, data = {}) => console.warn(`${colors.yellow}⚠${colors.reset}  ${msg}`, data),
  debug: (msg, data = {}) => process.env.DEBUG && console.log(`${colors.gray}[DEBUG]${colors.reset} ${msg}`, data),
  section: (msg) => console.log(`\n${colors.blue}━━━${colors.reset} ${msg} ${colors.blue}━━━${colors.reset}\n`),
};

export const formatTxId = (txid) => `${txid.slice(0, 8)}...${txid.slice(-8)}`;

export const logTransaction = (action, txid, details = {}) => {
  log.success(`${action}: ${formatTxId(txid)}`, details);
};
