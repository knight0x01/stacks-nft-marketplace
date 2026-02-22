export function renderListForm() {
  return `
    <form id="list-form">
      <h2>List NFT for Sale</h2>
      <div class="form-group">
        <label>NFT Contract</label>
        <input type="text" id="nft-contract" required>
      </div>
      <div class="form-group">
        <label>Token ID</label>
        <input type="number" id="token-id" required>
      </div>
      <div class="form-group">
        <label>Price (STX)</label>
        <input type="number" id="price" step="0.000001" required>
      </div>
      <button type="submit">List NFT</button>
    </form>
  `;
}
