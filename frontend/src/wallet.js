import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const network = process.env.NETWORK === 'testnet' 
  ? new StacksTestnet() 
  : new StacksMainnet();

export function connectWallet(onFinish, onCancel) {
  showConnect({
    appDetails: {
      name: 'Stacks NFT Marketplace',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish,
    onCancel,
    userSession,
  });
}

export function disconnectWallet() {
  userSession.signUserOut();
  window.location.reload();
}

export function getUserData() {
  if (!userSession.isUserSignedIn()) return null;
  return userSession.loadUserData();
}

export function getAddress() {
  const userData = getUserData();
  return userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet;
}

export function isSignedIn() {
  return userSession.isUserSignedIn();
}
