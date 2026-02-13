;; nft-marketplace.clar
;; A decentralized NFT marketplace on Stacks blockchain

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-listing-exists (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-price (err u104))
(define-constant err-paused (err u105))

;; Data Variables
(define-data-var platform-fee-percent uint u250) ;; 2.5%
(define-data-var is-paused bool false)
(define-data-var listing-nonce uint u0)

;; Data Maps
(define-map listings
    { listing-id: uint }
    {
        nft-contract: principal,
        token-id: uint,
        seller: principal,
        price: uint,
        active: bool
    }
)

(define-map user-listings
    { user: principal, listing-id: uint }
    bool
)

(define-map price-history
    { nft-contract: principal, token-id: uint, index: uint }
    {
        price: uint,
        timestamp: uint,
        listing-id: uint
    }
)

(define-map price-history-count
    { nft-contract: principal, token-id: uint }
    uint
)

;; Read-only functions
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
                active: true
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
