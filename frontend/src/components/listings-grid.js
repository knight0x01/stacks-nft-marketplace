import { Component } from '../core/component.js';
import { apiService } from '../api.js';
import { renderNFTCard } from './nft-card.js';

export class ListingsGrid extends Component {
  constructor(props) {
    super(props);
    this.state = { listings: [], loading: true };
  }

  async afterMount() {
    await this.loadListings();
  }

  async loadListings() {
    this.setState({ loading: true });
    const count = await apiService.fetchListings();
    const listings = [];
    
    for (let i = 0; i < count; i++) {
      const listing = await apiService.fetchListing(i);
      if (listing) listings.push(listing);
    }
    
    this.setState({ listings, loading: false });
  }

  render() {
    if (this.state.loading) {
      return '<div class="loading">Loading listings...</div>';
    }

    return `
      <div class="listings-grid">
        ${this.state.listings.map(listing => renderNFTCard(listing)).join('')}
      </div>
    `;
  }
}
