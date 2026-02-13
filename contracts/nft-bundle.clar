;; nft-bundle.clar
;; Bundle multiple NFTs for sale together

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u700))
(define-constant err-not-found (err u701))
(define-constant err-unauthorized (err u702))
(define-constant err-invalid-bundle (err u703))

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
        (asserts! (> nft-count u0) err-invalid-bundle)
        
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
            (bundle (unwrap! (map-get? bundles { bundle-id: bundle-id }) err-not-found))
        )
        (asserts! (is-eq tx-sender (get seller bundle)) err-unauthorized)
        (asserts! (< index (get nft-count bundle)) err-invalid-bundle)
        
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
            (bundle (unwrap! (map-get? bundles { bundle-id: bundle-id }) err-not-found))
        )
        (asserts! (get active bundle) err-not-found)
        
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
