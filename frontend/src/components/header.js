export function renderHeader(userData) {
  if (userData) {
    const address = userData.profile.stxAddress.mainnet;
    return `
      <header>
        <div class="logo">NFT Marketplace</div>
        <nav>
          <a href="#listings">Listings</a>
          <a href="#auctions">Auctions</a>
          <a href="#my-nfts">My NFTs</a>
        </nav>
        <div class="wallet">
          <span>${address.slice(0, 6)}...${address.slice(-4)}</span>
          <button id="disconnect-wallet">Disconnect</button>
        </div>
      </header>
    `;
  }
  
  return `
    <header>
      <div class="logo">NFT Marketplace</div>
      <button id="connect-wallet">Connect Wallet</button>
    </header>
  `;
}
