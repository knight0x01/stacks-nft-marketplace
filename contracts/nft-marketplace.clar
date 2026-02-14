;; ---------------------------------------------------------
;; NFT Marketplace Contract
;; ---------------------------------------------------------
;; A decentralized marketplace for SIP-009 NFTs on the Stacks blockchain.
;; This contract allows users to list NFTs for sale, purchase listed NFTs,
;; and manage platform-wide settings like fees and pausing.
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
(define-constant contract-owner tx-sender)

;; Error Codes
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-listing-exists (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-price (err u104))
(define-constant err-paused (err u105))

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------

;; Platform fee in basis points (e.g., 250 = 2.5%)
(define-data-var platform-fee-percent uint u250)

;; Circuit breaker status
(define-data-var is-paused bool false)

;; Continuous counter for unique listing IDs
(define-data-var listing-nonce uint u0)

;; Charge for featuring a listing on the homepage (in micro-STX)
(define-data-var featured-fee uint u5000000) ;; 5 STX

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Store all details for each NFT listing
(define-map listings
    { listing-id: uint }
    {
        nft-contract: principal,
        token-id: uint,
        seller: principal,
        price: uint,
        active: bool,
        featured: bool
    }
)

;; Map to track listings created by a specific user
(define-map user-listings
    { user: principal, listing-id: uint }
    bool
)

;; Store historical sale prices for analytics and floor price calculation
(define-map price-history
    { nft-contract: principal, token-id: uint, index: uint }
    {
        price: uint,
        timestamp: uint,
        listing-id: uint
    }
)

;; Counter for price records per specific NFT
(define-map price-history-count
    { nft-contract: principal, token-id: uint }
    uint
)

;; Track listings that have been promoted via the featured fee
(define-map featured-listings
    { listing-id: uint }
    bool
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

;; Get details for a specific listing
(define-read-only (get-listing (listing-id uint))
    (map-get? listings { listing-id: listing-id })
)

;; Get the current platform fee percentage
(define-read-only (get-platform-fee)
    (ok (var-get platform-fee-percent))
)

;; Check if the contract is currently paused
(define-read-only (is-contract-paused)
    (ok (var-get is-paused))
)

;; Retrieve price history for a specific NFT index
(define-read-only (get-price-history (nft-contract principal) (token-id uint) (index uint))
    (map-get? price-history { nft-contract: nft-contract, token-id: token-id, index: index })
)

;; Get total number of price history entries for an NFT
(define-read-only (get-price-history-count (nft-contract principal) (token-id uint))
    (default-to u0 (map-get? price-history-count { nft-contract: nft-contract, token-id: token-id }))
)

;; Calculate the average sale price for an NFT (currently limited by fold)
(define-read-only (get-average-price (nft-contract principal) (token-id uint))
    (let
        (
            (count (get-price-history-count nft-contract token-id))
        )
        (if (> count u0)
            (ok (/ (fold + (map get-price (get-all-prices nft-contract token-id count)) u0) count))
            (ok u0)
        )
    )
)

;; Check if a listing is promoted
(define-read-only (is-featured (listing-id uint))
    (default-to false (map-get? featured-listings { listing-id: listing-id }))
)

;; Get the current fee for featuring a listing
(define-read-only (get-featured-fee)
    (ok (var-get featured-fee))
)

;; Public functions
(define-public (create-listing (nft-contract principal) (token-id uint) (price uint))
    (let
        (
            (new-id (+ (var-get listing-nonce) u1))
        )
        (asserts! (not (var-get is-paused)) err-paused)
        (asserts! (> price u0) err-invalid-price)
        
        ;; Store listing
        (map-set listings
            { listing-id: new-id }
            {
                nft-contract: nft-contract,
                token-id: token-id,
                seller: tx-sender,
                price: price,
                active: true,
                featured: false
            }
        )
        
        ;; Track user listing
        (map-set user-listings
            { user: tx-sender, listing-id: new-id }
            true
        )
        
        ;; Record price history
        (let
            (
                (history-count (get-price-history-count nft-contract token-id))
                (new-index (+ history-count u1))
            )
            (map-set price-history
                { nft-contract: nft-contract, token-id: token-id, index: new-index }
                {
                    price: price,
                    timestamp: block-height,
                    listing-id: new-id
                }
            )
            (map-set price-history-count
                { nft-contract: nft-contract, token-id: token-id }
                new-index
            )
        )
        
        (var-set listing-nonce new-id)
        (ok new-id)
    )
)

(define-public (cancel-listing (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
        )
        (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
        (asserts! (get active listing) err-not-found)
        
        (map-set listings
            { listing-id: listing-id }
            (merge listing { active: false })
        )
        (ok true)
    )
)

(define-public (purchase-listing (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
            (price (get price listing))
            (fee (/ (* price (var-get platform-fee-percent)) u10000))
            (seller-amount (- price fee))
        )
        (asserts! (not (var-get is-paused)) err-paused)
        (asserts! (get active listing) err-not-found)
        
        ;; Transfer STX to seller
        (try! (stx-transfer? seller-amount tx-sender (get seller listing)))
        
        ;; Transfer platform fee
        (try! (stx-transfer? fee tx-sender contract-owner))
        
        ;; Mark listing as inactive
        (map-set listings
            { listing-id: listing-id }
            (merge listing { active: false })
        )
        
        (ok true)
    )
)

(define-public (feature-listing (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
        )
        (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
        (asserts! (get active listing) err-not-found)
        
        ;; Pay featured fee
        (try! (stx-transfer? (var-get featured-fee) tx-sender contract-owner))
        
        ;; Mark as featured
        (map-set listings
            { listing-id: listing-id }
            (merge listing { featured: true })
        )
        (map-set featured-listings
            { listing-id: listing-id }
            true
        )
        (ok true)
    )
)

;; Admin functions
(define-public (set-platform-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (<= new-fee u1000) err-invalid-price) ;; Max 10%
        (var-set platform-fee-percent new-fee)
        (ok true)
    )
)

(define-public (toggle-pause)
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (var-set is-paused (not (var-get is-paused)))
        (ok true)
    )
)
