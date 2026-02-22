export function renderMyNFTs() {
  return `
    <section class="my-nfts">
      <h2>My NFTs</h2>
      <div class="actions">
        <button id="list-nft-btn">List NFT</button>
        <button id="create-auction-btn">Create Auction</button>
      </div>
      <div id="my-nfts-grid" class="grid">
        <p>Loading your NFTs...</p>
      </div>
    </section>
  `;
}
