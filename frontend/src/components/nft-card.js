export function renderNFTCard(nft) {
  return `
    <div class="nft-card">
      <img src="${nft.image || '/placeholder.png'}" alt="${nft.name}">
      <div class="nft-info">
        <h3>${nft.name}</h3>
        <p class="price">${nft.price} STX</p>
        <button class="buy-btn" data-id="${nft.id}">Buy Now</button>
      </div>
    </div>
  `;
}
