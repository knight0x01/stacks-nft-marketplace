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

    if (signedIn && address) {
      connectBtn?.classList.add('hidden');
      disconnectBtn?.classList.remove('hidden');
      if (userAddress) userAddress.textContent = this.truncateAddress(address);
      marketplaceActions?.classList.remove('hidden');
    } else {
      connectBtn?.classList.remove('hidden');
      disconnectBtn?.classList.add('hidden');
      if (userAddress) userAddress.textContent = '';
      marketplaceActions?.classList.add('hidden');
    }
  }

  attachEventListeners() {
    document.getElementById('connect-wallet')?.addEventListener('click', () => {
      connectWallet(
        () => {
          console.log('Wallet connected');
          this.updateUI();
        },
        () => console.log('Connection cancelled')
      );
    });

    document.getElementById('disconnect-wallet')?.addEventListener('click', () => {
      disconnectWallet();
    });

    // List NFT Form
    document.getElementById('list-nft-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        await listNFT(
          formData.get('nft-contract'),
          parseInt(formData.get('token-id')),
          parseInt(formData.get('price')) * 1000000, // Convert to microSTX
          parseInt(formData.get('expiry'))
        );
        this.showNotification('NFT listed successfully!', 'success');
      } catch (error) {
        this.showNotification('Failed to list NFT: ' + error.message, 'error');
      }
    });

    // Buy NFT Form
    document.getElementById('buy-nft-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        await buyNFT(
          formData.get('nft-contract'),
          parseInt(formData.get('listing-id')),
          parseInt(formData.get('price')) * 1000000,
          formData.get('seller')
        );
        this.showNotification('Purchase initiated!', 'success');
      } catch (error) {
        this.showNotification('Failed to buy NFT: ' + error.message, 'error');
      }
    });

    // Create Auction Form
    document.getElementById('create-auction-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        await createAuction(
          formData.get('nft-contract'),
          parseInt(formData.get('token-id')),
          parseInt(formData.get('reserve-price')) * 1000000,
          parseInt(formData.get('duration'))
        );
        this.showNotification('Auction created!', 'success');
      } catch (error) {
        this.showNotification('Failed to create auction: ' + error.message, 'error');
      }
    });

    // Place Bid Form
    document.getElementById('place-bid-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        await placeBid(
          parseInt(formData.get('auction-id')),
          parseInt(formData.get('bid-amount')) * 1000000
        );
        this.showNotification('Bid placed!', 'success');
      } catch (error) {
        this.showNotification('Failed to place bid: ' + error.message, 'error');
      }
    });

    // Make Offer Form
    document.getElementById('make-offer-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        await makeOffer(
          formData.get('nft-contract'),
          parseInt(formData.get('token-id')),
          parseInt(formData.get('offer-amount')) * 1000000,
          parseInt(formData.get('expiry'))
        );
        this.showNotification('Offer made!', 'success');
      } catch (error) {
        this.showNotification('Failed to make offer: ' + error.message, 'error');
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
