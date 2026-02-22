export function renderAuctionCard(auction) {
  return `
    <div class="auction-card">
      <img src="${auction.image || '/placeholder.png'}" alt="${auction.name}">
      <div class="auction-info">
        <h3>${auction.name}</h3>
        <p class="current-bid">${auction.currentBid} STX</p>
        <p class="time-left">${auction.timeLeft}</p>
        <button class="bid-btn" data-id="${auction.id}">Place Bid</button>
      </div>
    </div>
  `;
}
