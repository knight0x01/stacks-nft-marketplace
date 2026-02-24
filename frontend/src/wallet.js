import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const network = new StacksMainnet();

export function connectWallet() {
  return new Promise((resolve, reject) => {
    showConnect({
      appDetails: {
        name: 'Stacks NFT Marketplace',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: (data) => {
        console.log('Wallet connected:', data);
        resolve(data);
      },
      onCancel: () => {
        console.log('Connection cancelled');
        reject(new Error('User cancelled'));
      },
      userSession,
    });
  });
}

export function disconnectWallet() {
  userSession.signUserOut();
  window.location.reload();
}

export function isSignedIn() {
  return userSession.isUserSignedIn();
}

export function getUserData() {
  if (!isSignedIn()) return null;
  return userSession.loadUserData();
}

export function getAddress() {
  const userData = getUserData();
  if (!userData) return null;
  return userData.profile.stxAddress.mainnet;
}
