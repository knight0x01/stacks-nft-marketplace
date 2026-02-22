#!/bin/bash

echo "🔧 Starting professional refactoring - 23 commits"

# Commit 1: Router
git add frontend/src/router.js
git commit -m "refactor: add client-side router for SPA navigation"

# Commit 2: Constants
git add frontend/src/constants.js
git commit -m "refactor: extract constants for error and success messages"

# Commit 3: Event bus
git add frontend/src/event-bus.js
git commit -m "refactor: implement event bus for decoupled component communication"

# Commit 4: Refactor main app
git add frontend/src/index.js
git commit -m "refactor: convert main app to class-based architecture with router"

# Commit 5: Marketplace service
git add frontend/src/marketplace.js
git commit -m "refactor: convert marketplace to service class with error handling"

# Commit 6: Buy service
git add frontend/src/buy.js
git commit -m "refactor: convert buy to service class with event emission"

# Commit 7: Auction service
git add frontend/src/auction.js
git commit -m "refactor: convert auction to service class"

# Commit 8: Bid service
git add frontend/src/bid.js
git commit -m "refactor: convert bid to service class"

# Commit 9: API service
git add frontend/src/api.js
git commit -m "refactor: enhance API service with additional methods"

# Commit 10: Validation utilities
git add frontend/src/utils/validation.js
git commit -m "refactor: add input validation utilities"

# Commit 11: Storage service
git add frontend/src/utils/storage.js
git commit -m "refactor: implement localStorage wrapper service"

# Commit 12: Loading service
git add frontend/src/utils/loading.js
git commit -m "refactor: add global loading state management"

# Commit 13: Base component
git add frontend/src/core/component.js
git commit -m "refactor: create base component class for reusability"

# Commit 14: Listings grid component
git add frontend/src/components/listings-grid.js
git commit -m "refactor: convert listings to component class"

# Commit 15: Async utilities
git add frontend/src/utils/async.js
git commit -m "refactor: add retry, debounce, and throttle utilities"

# Commit 16: Logger
git add frontend/src/utils/logger.js
git commit -m "refactor: implement structured logging utility"

# Commit 17: Environment config
git add frontend/src/env.js
git commit -m "refactor: centralize environment configuration"

# Commit 18: Cache utility
git add frontend/src/utils/cache.js
git commit -m "refactor: add TTL-based caching utility"

# Commit 19: CSS variables
git add frontend/styles/variables.css
git commit -m "refactor: extract CSS variables for theming"

# Commit 20: Loader styles
git add frontend/styles/loader.css
git commit -m "style: add loading spinner styles"

# Commit 21: Refactor main CSS
git add frontend/styles/main.css
git commit -m "refactor: improve main CSS with variables and responsive design"

# Commit 22: Refactor HTML
git add frontend/index.html
git commit -m "refactor: enhance HTML with meta tags and all stylesheets"

# Commit 23: Barrel exports
git add frontend/src/index.exports.js
git commit -m "refactor: add barrel exports for cleaner imports

Complete professional refactoring:
- Service-based architecture
- Event-driven communication
- Component-based UI
- Utility modules (validation, storage, cache, logger)
- Async helpers (retry, debounce, throttle)
- CSS variables and responsive design
- Improved error handling
- Better code organization"

echo "✅ All 23 refactoring commits created!"
echo "Pushing to knight0x01/stacks-nft-marketplace..."

git push origin main

echo "🎉 Successfully pushed refactored codebase!"
