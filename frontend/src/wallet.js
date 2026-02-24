import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

export const network = new StacksMainnet();

export async function connectWallet() {
  if (isConnected()) {
    console.log('Already authenticated');
    return getLocalStorage();
  }

  const response = await connect();
  console.log('Connected:', response.addresses);
  return response;
}

export function disconnectWallet() {
  disconnect();
  window.location.reload();
}

export function isSignedIn() {
  return isConnected();
}

export function getUserData() {
  return getLocalStorage();
}

export function getAddress() {
  const userData = getUserData();
  if (!userData?.addresses) return null;
  return userData.addresses.stx[0].address;
}

export function getBTCAddress() {
  const userData = getUserData();
  if (!userData?.addresses) return null;
  return userData.addresses.btc[0].address;
}

export function getAllAddresses() {
  const userData = getUserData();
  if (!userData?.addresses) return null;
  return {
    stx: userData.addresses.stx[0].address,
    btc: userData.addresses.btc[0].address,
  };
}

export async function getAccountDetails() {
  const accounts = await request('stx_getAccounts');
  const account = accounts.addresses[0];
  return {
    address: account.address,
    publicKey: account.publicKey,
    gaiaHubUrl: account.gaiaHubUrl,
  };
}
