import { connectWallet, disconnectWallet, isSignedIn, getAddress } from './wallet.js';
import { listNFT, buyNFT, createAuction, placeBid, makeOffer } from './contracts.js';

class MarketplaceApp {
  constructor() {
    this.init();
  }

  init() {
    this.updateUI();
    this.attachEventListeners();
  }

  updateUI() {
    const signedIn = isSignedIn();
    const address = getAddress();

    const connectBtn = document.getElementById('connect-wallet');
    const disconnectBtn = document.getElementById('disconnect-wallet');
    const userAddress = document.getElementById('user-address');
    const marketplaceActions = document.getElementById('marketplace-actions');
    const welcomeMessage = document.getElementById('welcome-message');

    if (signedIn && address) {
      connectBtn?.classList.add('hidden');
      disconnectBtn?.classList.remove('hidden');
      if (userAddress) userAddress.textContent = this.truncateAddress(address);
      marketplaceActions?.classList.remove('hidden');
      welcomeMessage?.classList.add('hidden');
    } else {
      connectBtn?.classList.remove('hidden');
      disconnectBtn?.classList.add('hidden');
      if (userAddress) userAddress.textContent = '';
      marketplaceActions?.classList.add('hidden');
      welcomeMessage?.classList.remove('hidden');
    }
  }

  attachEventListeners() {
    document.getElementById('connect-wallet')?.addEventListener('click', async () => {
      try {
        await connectWallet();
        this.updateUI();
        this.showNotification('Wallet connected successfully!', 'success');
      } catch (error) {
        this.showNotification('Failed to connect wallet', 'error');
      }
    });

    document.getElementById('disconnect-wallet')?.addEventListener('click', () => {
      disconnectWallet();
    });

    // List NFT Form
    document.getElementById('list-nft-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const result = await listNFT(
          formData.get('nft-contract'),
          parseInt(formData.get('token-id')),
          parseInt(formData.get('price')) * 1000000,
          parseInt(formData.get('expiry'))
        );
        this.showNotification('NFT listed! TX: ' + result.txId.slice(0, 8) + '...', 'success');
        e.target.reset();
      } catch (error) {
        this.showNotification(error.message, 'error');
      }
    });

    // Buy NFT Form
    document.getElementById('buy-nft-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const result = await buyNFT(
          formData.get('nft-contract'),
          parseInt(formData.get('listing-id')),
          parseInt(formData.get('price')) * 1000000
        );
        this.showNotification('Purchase initiated! TX: ' + result.txId.slice(0, 8) + '...', 'success');
        e.target.reset();
      } catch (error) {
        this.showNotification(error.message, 'error');
      }
    });

    // Create Auction Form
    document.getElementById('create-auction-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const result = await createAuction(
          formData.get('nft-contract'),
          parseInt(formData.get('token-id')),
          parseInt(formData.get('reserve-price')) * 1000000,
          parseInt(formData.get('duration'))
        );
        this.showNotification('Auction created! TX: ' + result.txId.slice(0, 8) + '...', 'success');
        e.target.reset();
      } catch (error) {
        this.showNotification(error.message, 'error');
      }
    });

    // Place Bid Form
    document.getElementById('place-bid-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const result = await placeBid(
          parseInt(formData.get('auction-id')),
          parseInt(formData.get('bid-amount')) * 1000000
        );
        this.showNotification('Bid placed! TX: ' + result.txId.slice(0, 8) + '...', 'success');
        e.target.reset();
      } catch (error) {
        this.showNotification(error.message, 'error');
      }
    });

    // Make Offer Form
    document.getElementById('make-offer-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const result = await makeOffer(
          formData.get('nft-contract'),
          parseInt(formData.get('token-id')),
          parseInt(formData.get('offer-amount')) * 1000000,
          parseInt(formData.get('expiry'))
        );
        this.showNotification('Offer made! TX: ' + result.txId.slice(0, 8) + '...', 'success');
        e.target.reset();
      } catch (error) {
        this.showNotification(error.message, 'error');
      }
    });
  }

  truncateAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MarketplaceApp());
} else {
  new MarketplaceApp();
}

export default MarketplaceApp;
