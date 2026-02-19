;; NFT Marketplace Contract
;; Decentralized marketplace for SIP-009 NFTs on Stacks blockchain

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-listing-exists (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-price (err u104))
(define-constant err-paused (err u105))
(define-constant err-invalid-fee (err u106))

;; Data Variables
(define-data-var platform-fee-percent uint u250)
(define-data-var is-paused bool false)
(define-data-var listing-nonce uint u0)
(define-data-var featured-fee uint u5000000)

;; Data Maps
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

(define-map user-listings { user: principal, listing-id: uint } bool)
(define-map featured-listings { listing-id: uint } bool)
(define-map price-history
    { nft-contract: principal, token-id: uint, index: uint }
    { price: uint, timestamp: uint, listing-id: uint }
)
(define-map price-history-count { nft-contract: principal, token-id: uint } uint)

;; Read-Only Functions
(define-read-only (get-listing (listing-id uint))
    (map-get? listings { listing-id: listing-id })
)

(define-read-only (get-platform-fee)
    (ok (var-get platform-fee-percent))
)

(define-read-only (is-contract-paused)
    (ok (var-get is-paused))
)

(define-read-only (get-price-history (nft-contract principal) (token-id uint) (index uint))
    (map-get? price-history { nft-contract: nft-contract, token-id: token-id, index: index })
)

(define-read-only (get-price-history-count (nft-contract principal) (token-id uint))
    (default-to u0 (map-get? price-history-count { nft-contract: nft-contract, token-id: token-id }))
)

(define-read-only (is-featured (listing-id uint))
    (default-to false (map-get? featured-listings { listing-id: listing-id }))
)

(define-read-only (get-featured-fee)
    (ok (var-get featured-fee))
)

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; @desc Create a new listing for an NFT
;; @param nft-contract: The principal of the SIP-009 NFT contract
;; @param token-id: The ID of the token being listed
;; @param price: The sale price in micro-STX
(define-public (create-listing (nft-contract principal) (token-id uint) (price uint))
    (let
        (
            (new-id (+ (var-get listing-nonce) u1))
        )
        ;; Assertions
        (asserts! (not (var-get is-paused)) err-paused)
        (asserts! (> price u0) err-invalid-price)
        
        ;; Record the new listing
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
        
        ;; Add to user's listing tracking
        (map-set user-listings
            { user: tx-sender, listing-id: new-id }
            true
        )
        
        ;; Update price history for market analytics
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
        
        ;; Finalize listing creation
        (var-set listing-nonce new-id)
        
        ;; Event emission
        (print { event: "create-listing", listing-id: new-id, seller: tx-sender, price: price })
        
        (ok new-id)
    )
)

;; @desc Cancel an active listing
;; @param listing-id: The unique ID of the listing to cancel
(define-public (cancel-listing (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
        )
        ;; Authorization check
        (asserts! (is-eq tx-sender (get seller listing)) err-unauthorized)
        ;; Status check
        (asserts! (get active listing) err-not-found)
        
        ;; Deactivate listing
        (map-set listings
            { listing-id: listing-id }
            (merge listing { active: false })
        )
        
        ;; Event emission
        (print { event: "cancel-listing", listing-id: listing-id })
        (ok true)
    )
)

;; @desc Purchase an active listing
;; @param listing-id: The unique ID of the listing to purchase
(define-public (purchase-listing (listing-id uint))
    (let
        (
            (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
            (price (get price listing))
            (fee (/ (* price (var-get platform-fee-percent)) u10000))
            (seller-amount (- price fee))
        )
        ;; Checks
        (asserts! (not (var-get is-paused)) err-paused)
        (asserts! (get active listing) err-not-found)
        
        ;; Payout to seller
        (try! (stx-transfer? seller-amount tx-sender (get seller listing)))
        
        ;; Payout platform fee
        (try! (stx-transfer? fee tx-sender contract-owner))
        
        ;; Mark as sold/inactive
        (map-set listings
            { listing-id: listing-id }
            (merge listing { active: false })
        )
        
        ;; Event emission
        (print { event: "purchase-listing", listing-id: listing-id, buyer: tx-sender, price: price })
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
