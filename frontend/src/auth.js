import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export function connectWallet() {
  showConnect({
    appDetails: {
      name: 'Stacks NFT Marketplace',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

export function disconnectWallet() {
  userSession.signUserOut();
  window.location.reload();
}

export function getUserData() {
  return userSession.loadUserData();
}

export function isUserSignedIn() {
  return userSession.isUserSignedIn();
}
