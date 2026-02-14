;; ---------------------------------------------------------
;; NFT Bundle Contract
;; ---------------------------------------------------------
;; This contract allows users to bundle multiple NFTs and sell them
;; together for a single STX price. 
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
(define-constant CONTRACT_OWNER tx-sender)

;; Error Codes
(define-constant ERR_OWNER_ONLY (err u700))
(define-constant ERR_NOT_FOUND (err u701))
(define-constant ERR_UNAUTHORIZED (err u702))
(define-constant ERR_INVALID_BUNDLE (err u703))

(define-data-var bundle-nonce uint u0)

(define-map bundles
    { bundle-id: uint }
    {
        seller: principal,
        price: uint,
        active: bool,
        nft-count: uint
    }
)

(define-map bundle-nfts
    { bundle-id: uint, index: uint }
    {
        nft-contract: principal,
        token-id: uint
    }
)

(define-read-only (get-bundle (bundle-id uint))
    (map-get? bundles { bundle-id: bundle-id })
)

(define-public (create-bundle (price uint) (nft-count uint))
    (let
        (
            (new-id (+ (var-get bundle-nonce) u1))
        )
        (asserts! (> nft-count u0) ERR_INVALID_BUNDLE)
        
        (map-set bundles
            { bundle-id: new-id }
            {
                seller: tx-sender,
                price: price,
                active: true,
                nft-count: nft-count
            }
        )
        (var-set bundle-nonce new-id)
        (ok new-id)
    )
)

(define-public (add-nft-to-bundle (bundle-id uint) (index uint) (nft-contract principal) (token-id uint))
    (let
        (
            (bundle (unwrap! (map-get? bundles { bundle-id: bundle-id }) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (get seller bundle)) ERR_UNAUTHORIZED)
        (asserts! (< index (get nft-count bundle)) ERR_INVALID_BUNDLE)
        
        (map-set bundle-nfts
            { bundle-id: bundle-id, index: index }
            {
                nft-contract: nft-contract,
                token-id: token-id
            }
        )
        (ok true)
    )
)

(define-public (purchase-bundle (bundle-id uint))
    (let
        (
            (bundle (unwrap! (map-get? bundles { bundle-id: bundle-id }) ERR_NOT_FOUND))
        )
        (asserts! (get active bundle) ERR_NOT_FOUND)
        
        ;; Transfer STX
        (try! (stx-transfer? (get price bundle) tx-sender (get seller bundle)))
        
        ;; Mark as inactive
        (map-set bundles
            { bundle-id: bundle-id }
            (merge bundle { active: false })
        )
        (ok true)
    )
)
