export function renderAuctionForm() {
  return `
    <form id="auction-form">
      <h2>Create Auction</h2>
      <div class="form-group">
        <label>NFT Contract</label>
        <input type="text" id="auction-nft-contract" required>
      </div>
      <div class="form-group">
        <label>Token ID</label>
        <input type="number" id="auction-token-id" required>
      </div>
      <div class="form-group">
        <label>Starting Price (STX)</label>
        <input type="number" id="start-price" step="0.000001" required>
      </div>
      <div class="form-group">
        <label>Duration (blocks)</label>
        <input type="number" id="duration" required>
      </div>
      <button type="submit">Create Auction</button>
    </form>
  `;
}
