export const ENV = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.mainnet.hiro.so',
};
