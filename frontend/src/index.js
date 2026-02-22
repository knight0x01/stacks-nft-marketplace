import { connectWallet, disconnectWallet, isUserSignedIn, getUserData } from './auth.js';
import { renderHeader } from './components/header.js';
import { renderListings } from './components/listings.js';
import { Router } from './router.js';

class App {
  constructor() {
    this.router = new Router();
    this.init();
  }

  init() {
    this.setupRoutes();
    this.render();
  }

  setupRoutes() {
    this.router.on('/', () => this.renderHome());
    this.router.on('/listings', () => this.renderListings());
    this.router.on('/auctions', () => this.renderAuctions());
    this.router.on('/my-nfts', () => this.renderMyNFTs());
  }

  render() {
    const app = document.getElementById('app');
    const userData = isUserSignedIn() ? getUserData() : null;
    
    app.innerHTML = renderHeader(userData);
    this.router.navigate(window.location.pathname);
    this.attachEventListeners();
  }

  renderHome() {
    const content = document.createElement('div');
    content.className = 'hero';
    content.innerHTML = `
      <h1>Stacks NFT Marketplace</h1>
      <p>Connect your wallet to start trading NFTs</p>
    `;
    document.getElementById('app').appendChild(content);
  }

  renderListings() {
    const content = document.createElement('div');
    content.innerHTML = renderListings();
    document.getElementById('app').appendChild(content);
  }

  renderAuctions() {
    const content = document.createElement('div');
    content.innerHTML = '<h2>Auctions</h2>';
    document.getElementById('app').appendChild(content);
  }

  renderMyNFTs() {
    const content = document.createElement('div');
    content.innerHTML = '<h2>My NFTs</h2>';
    document.getElementById('app').appendChild(content);
  }

  attachEventListeners() {
    document.getElementById('connect-wallet')?.addEventListener('click', connectWallet);
    document.getElementById('disconnect-wallet')?.addEventListener('click', disconnectWallet);
  }
}

new App();
