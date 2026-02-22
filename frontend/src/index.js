import { connectWallet, disconnectWallet, isUserSignedIn, getUserData } from './auth.js';
import { renderHeader } from './components/header.js';
import { renderListings } from './components/listings.js';

function render() {
  const app = document.getElementById('app');
  
  if (isUserSignedIn()) {
    const userData = getUserData();
    app.innerHTML = `
      ${renderHeader(userData)}
      ${renderListings()}
    `;
    attachEventListeners();
  } else {
    app.innerHTML = `
      ${renderHeader(null)}
      <div class="hero">
        <h1>Stacks NFT Marketplace</h1>
        <p>Connect your wallet to start trading NFTs</p>
      </div>
    `;
    attachEventListeners();
  }
}

function attachEventListeners() {
  const connectBtn = document.getElementById('connect-wallet');
  const disconnectBtn = document.getElementById('disconnect-wallet');
  
  if (connectBtn) {
    connectBtn.addEventListener('click', connectWallet);
  }
  
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', disconnectWallet);
  }
}

render();
