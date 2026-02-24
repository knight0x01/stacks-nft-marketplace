;; NFT Marketplace - Production Ready
;; Secure, gas-optimized marketplace for SIP-009 NFTs

;; Traits
(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.sip-009-nft-trait.sip-009-nft-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PRICE (err u103))
(define-constant ERR_PAUSED (err u104))
(define-constant ERR_INVALID_FEE (err u105))
(define-constant ERR_TRANSFER_FAILED (err u106))
(define-constant ERR_EXPIRED (err u107))

(define-constant MAX_FEE u1000) ;; 10%
(define-constant MIN_PRICE u1000000) ;; 1 STX minimum

;; Data Variables
(define-data-var platform-fee uint u250) ;; 2.5%
(define-data-var paused bool false)
(define-data-var listing-id-nonce uint u0)
(define-data-var treasury principal CONTRACT_OWNER)

;; Data Maps
(define-map listings
    uint
    {
        nft-contract: principal,
        token-id: uint,
        seller: principal,
        price: uint,
        expiry: uint,
        created-at: uint
    }
)

(define-map active-listings uint bool)
(define-map seller-listings { seller: principal, listing-id: uint } bool)
(define-map nft-listing { nft-contract: principal, token-id: uint } uint)

;; Private Functions
(define-private (calculate-fee (price uint))
    (/ (* price (var-get platform-fee)) u10000)
)

(define-private (transfer-proceeds (price uint) (seller principal))
    (let (
        (fee (calculate-fee price))
        (seller-amount (- price fee))
    )
        (try! (stx-transfer? seller-amount tx-sender seller))
        (try! (stx-transfer? fee tx-sender (var-get treasury)))
        (ok { fee: fee, seller-amount: seller-amount })
    )
)

;; Read-Only Functions
(define-read-only (get-listing (id uint))
    (ok (map-get? listings id))
)

(define-read-only (is-active (id uint))
    (default-to false (map-get? active-listings id))
)

(define-read-only (get-nft-listing (nft-contract principal) (token-id uint))
    (ok (map-get? nft-listing { nft-contract: nft-contract, token-id: token-id }))
)

(define-read-only (get-platform-fee)
    (ok (var-get platform-fee))
)

(define-read-only (is-paused)
    (ok (var-get paused))
)

(define-read-only (calculate-proceeds (price uint))
    (let ((fee (calculate-fee price)))
        (ok { fee: fee, seller-amount: (- price fee), total: price })
    )
)

;; Public Functions
(define-public (list-nft 
    (nft-contract <nft-trait>) 
    (token-id uint) 
    (price uint) 
    (expiry uint))
    (let (
        (listing-id (+ (var-get listing-id-nonce) u1))
        (nft-principal (contract-of nft-contract))
    )
        (asserts! (not (var-get paused)) ERR_PAUSED)
        (asserts! (>= price MIN_PRICE) ERR_INVALID_PRICE)
        (asserts! (> expiry block-height) ERR_EXPIRED)
        (asserts! (is-none (map-get? nft-listing { nft-contract: nft-principal, token-id: token-id })) 
            ERR_ALREADY_EXISTS)
        
        ;; Transfer NFT to contract
        (try! (contract-call? nft-contract transfer token-id tx-sender (as-contract tx-sender)))
        
        ;; Create listing
        (map-set listings listing-id {
            nft-contract: nft-principal,
            token-id: token-id,
            seller: tx-sender,
            price: price,
            expiry: expiry,
            created-at: block-height
        })
        
        (map-set active-listings listing-id true)
        (map-set seller-listings { seller: tx-sender, listing-id: listing-id } true)
        (map-set nft-listing { nft-contract: nft-principal, token-id: token-id } listing-id)
        (var-set listing-id-nonce listing-id)
        
        (print { 
            event: "list-nft", 
            listing-id: listing-id, 
            seller: tx-sender, 
            price: price,
            nft-contract: nft-principal,
            token-id: token-id
        })
        (ok listing-id)
    )
)

(define-public (unlist-nft (nft-contract <nft-trait>) (listing-id uint))
    (let (
        (listing (unwrap! (map-get? listings listing-id) ERR_NOT_FOUND))
        (nft-principal (contract-of nft-contract))
    )
        (asserts! (is-eq tx-sender (get seller listing)) ERR_UNAUTHORIZED)
        (asserts! (is-active listing-id) ERR_NOT_FOUND)
        
        ;; Return NFT to seller
        (try! (as-contract (contract-call? nft-contract transfer 
            (get token-id listing) 
            tx-sender 
            (get seller listing))))
        
        ;; Deactivate listing
        (map-delete active-listings listing-id)
        (map-delete nft-listing { 
            nft-contract: (get nft-contract listing), 
            token-id: (get token-id listing) 
        })
        
        (print { event: "unlist-nft", listing-id: listing-id })
        (ok true)
    )
)

(define-public (buy-nft (nft-contract <nft-trait>) (listing-id uint))
    (let (
        (listing (unwrap! (map-get? listings listing-id) ERR_NOT_FOUND))
        (nft-principal (contract-of nft-contract))
    )
        (asserts! (not (var-get paused)) ERR_PAUSED)
        (asserts! (is-active listing-id) ERR_NOT_FOUND)
        (asserts! (<= block-height (get expiry listing)) ERR_EXPIRED)
        (asserts! (is-eq nft-principal (get nft-contract listing)) ERR_UNAUTHORIZED)
        
        ;; Transfer payment
        (try! (transfer-proceeds (get price listing) (get seller listing)))
        
        ;; Transfer NFT to buyer
        (try! (as-contract (contract-call? nft-contract transfer 
            (get token-id listing) 
            tx-sender 
            tx-sender)))
        
        ;; Deactivate listing
        (map-delete active-listings listing-id)
        (map-delete nft-listing { 
            nft-contract: (get nft-contract listing), 
            token-id: (get token-id listing) 
        })
        
        (print { 
            event: "buy-nft", 
            listing-id: listing-id, 
            buyer: tx-sender,
            seller: (get seller listing),
            price: (get price listing)
        })
        (ok true)
    )
)

(define-public (update-price (listing-id uint) (new-price uint))
    (let ((listing (unwrap! (map-get? listings listing-id) ERR_NOT_FOUND)))
        (asserts! (is-eq tx-sender (get seller listing)) ERR_UNAUTHORIZED)
        (asserts! (is-active listing-id) ERR_NOT_FOUND)
        (asserts! (>= new-price MIN_PRICE) ERR_INVALID_PRICE)
        
        (map-set listings listing-id (merge listing { price: new-price }))
        (print { event: "update-price", listing-id: listing-id, new-price: new-price })
        (ok true)
    )
)

;; Admin Functions
(define-public (set-platform-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (asserts! (<= new-fee MAX_FEE) ERR_INVALID_FEE)
        (var-set platform-fee new-fee)
        (print { event: "set-platform-fee", new-fee: new-fee })
        (ok true)
    )
)

(define-public (set-treasury (new-treasury principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set treasury new-treasury)
        (print { event: "set-treasury", new-treasury: new-treasury })
        (ok true)
    )
)

(define-public (toggle-pause)
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set paused (not (var-get paused)))
        (print { event: "toggle-pause", paused: (var-get paused) })
        (ok (var-get paused))
    )
)

(define-public (emergency-withdraw (nft-contract <nft-trait>) (token-id uint) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (asserts! (var-get paused) ERR_UNAUTHORIZED)
        (try! (as-contract (contract-call? nft-contract transfer token-id tx-sender recipient)))
        (print { event: "emergency-withdraw", nft-contract: (contract-of nft-contract), token-id: token-id })
        (ok true)
    )
)
