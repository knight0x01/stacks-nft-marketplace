export function renderBidForm(auctionId) {
  return `
    <form id="bid-form">
      <h2>Place Bid</h2>
      <p>Auction #${auctionId}</p>
      <div class="form-group">
        <label>Bid Amount (STX)</label>
        <input type="number" id="bid-amount" step="0.000001" required>
      </div>
      <button type="submit">Place Bid</button>
    </form>
  `;
}
