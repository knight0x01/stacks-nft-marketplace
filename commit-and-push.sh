#!/bin/bash

# Commit 1: Initial frontend structure
git add frontend/package.json
git commit -m "feat: add frontend package.json with Stacks dependencies"

# Commit 2: Base HTML
git add frontend/index.html
git commit -m "feat: create base HTML structure"

# Commit 3: Vite config
git add frontend/vite.config.js
git commit -m "feat: add Vite configuration"

# Commit 4: Frontend gitignore
git add frontend/.gitignore
git commit -m "chore: add frontend gitignore"

# Commit 5: Auth module
git add frontend/src/auth.js
git commit -m "feat: implement wallet authentication with @stacks/connect"

# Commit 6: Config module
git add frontend/src/config.js
git commit -m "feat: add network and contract configuration"

# Commit 7: Marketplace module
git add frontend/src/marketplace.js
git commit -m "feat: implement NFT listing functionality"

# Commit 8: Buy module
git add frontend/src/buy.js
git commit -m "feat: implement NFT purchase functionality"

# Commit 9: Auction module
git add frontend/src/auction.js
git commit -m "feat: implement auction creation"

# Commit 10: Bid module
git add frontend/src/bid.js
git commit -m "feat: implement bidding functionality"

# Commit 11: API module
git add frontend/src/api.js
git commit -m "feat: add read-only contract calls"

# Commit 12: Main app
git add frontend/src/index.js
git commit -m "feat: create main application entry point"

# Commit 13: Header component
git add frontend/src/components/header.js
git commit -m "feat: add header component with wallet connection"

# Commit 14: Listings component
git add frontend/src/components/listings.js
git commit -m "feat: add listings display component"

# Commit 15: NFT card component
git add frontend/src/components/nft-card.js
git commit -m "feat: create NFT card component"

# Commit 16: Auction card component
git add frontend/src/components/auction-card.js
git commit -m "feat: create auction card component"

# Commit 17: Modal component
git add frontend/src/components/modal.js
git commit -m "feat: implement modal component"

# Commit 18: List form component
git add frontend/src/components/list-form.js
git commit -m "feat: add NFT listing form"

# Commit 19: Auction form component
git add frontend/src/components/auction-form.js
git commit -m "feat: add auction creation form"

# Commit 20: Bid form component
git add frontend/src/components/bid-form.js
git commit -m "feat: add bid placement form"

# Commit 21: My NFTs component
git add frontend/src/components/my-nfts.js
git commit -m "feat: add my NFTs view"

# Commit 22: Notifications utility
git add frontend/src/utils/notifications.js
git commit -m "feat: implement notification system"

# Commit 23: Format utilities
git add frontend/src/utils/format.js
git commit -m "feat: add formatting utilities"

# Commit 24: Main CSS
git add frontend/styles/main.css
git commit -m "style: add main stylesheet"

# Commit 25: NFT card CSS
git add frontend/styles/nft-card.css
git commit -m "style: add NFT card styles"

# Commit 26: Modal CSS
git add frontend/styles/modal.css
git commit -m "style: add modal styles"

# Commit 27: Form CSS
git add frontend/styles/form.css
git commit -m "style: add form styles"

# Commit 28: Notifications CSS
git add frontend/styles/notifications.css
git commit -m "style: add notification styles"

# Commit 29: Sections CSS
git add frontend/styles/sections.css
git commit -m "style: add sections styles"

# Commit 30: Frontend README
git add frontend/README.md
git commit -m "docs: add frontend documentation"

# Commit 31: Deployment scripts
git add scripts/deploy-*.js
git commit -m "feat: add deployment scripts for 20 NFT contracts"

# Commit 32: Interaction script
git add scripts/interact-deadfellaz-20tx.js
git commit -m "feat: add interaction script for deadfellaz"

# Commit 33: Deployment summary
git add deployments/batch-20-deployment-summary.md
git commit -m "docs: add deployment summary for 20 contracts"

# Commit 34: Security scan script
git add scripts/scan-secrets.sh
git commit -m "chore: add security scan script"

# Commit 35: Final integration
git add .
git commit -m "feat: complete frontend integration with @stacks/connect and @stacks/transactions

- Secure wallet connection (no private keys in frontend)
- NFT marketplace functionality
- Auction system
- Responsive UI
- 20 NFT contracts deployed to mainnet"

echo "✅ All 35 commits created!"
echo "Pushing to knight0x01/stacks-nft-marketplace..."

git push origin main

echo "🎉 Successfully pushed to GitHub!"
