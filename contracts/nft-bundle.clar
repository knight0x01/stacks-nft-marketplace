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

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------

;; Counter for generating unique bundle IDs
(define-data-var bundle-nonce uint u0)

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Store general details for each NFT bundle
(define-map bundles
    { bundle-id: uint }
    {
        seller: principal,
        price: uint,
        active: bool,
        nft-count: uint
    }
)

;; Store specific NFTs contained within each bundle
(define-map bundle-nfts
    { bundle-id: uint, index: uint }
    {
        nft-contract: principal,
        token-id: uint
    }
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

;; @desc Retrieve general details of a specific bundle
;; @param bundle-id: The unique bundle identifier
(define-read-only (get-bundle (bundle-id uint))
    (map-get? bundles { bundle-id: bundle-id })
)

;; @desc Helper to check if a specific bundle is still active and for sale
(define-read-only (is-bundle-active (bundle-id uint))
    (match (get-bundle bundle-id)
        bundle (get active bundle)
        false
    )
)

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; @desc Create a new bundle for sale
;; @param price: Total price for all NFTs in the bundle
;; @param nft-count: Number of NFTs that will be in this bundle
(define-public (create-bundle (price uint) (nft-count uint))
    (let
        (
            (new-id (+ (var-get bundle-nonce) u1))
        )
        ;; Validate counts
        (asserts! (> nft-count u0) ERR_INVALID_BUNDLE)
        
        ;; Save bundle header
        (map-set bundles
            { bundle-id: new-id }
            {
                seller: tx-sender,
                price: price,
                active: true,
                nft-count: nft-count
            }
        )
        
        ;; Update nonce
        (var-set bundle-nonce new-id)
        
        ;; Event emission
        (print { event: "create-bundle", bundle-id: new-id, seller: tx-sender, price: price, count: nft-count })
        
        (ok new-id)
    )
)

;; @desc Add a specific NFT to a previously created bundle
;; @param bundle-id: The unique ID of the bundle
;; @param index: The position (0 to count-1) in the bundle
;; @param nft-contract: The SIP-009 principal of the NFT
;; @param token-id: The specific token ID
(define-public (add-nft-to-bundle (bundle-id uint) (index uint) (nft-contract principal) (token-id uint))
    (let
        (
            (bundle (unwrap! (map-get? bundles { bundle-id: bundle-id }) ERR_NOT_FOUND))
        )
        ;; Ownership check
        (asserts! (is-eq tx-sender (get seller bundle)) ERR_UNAUTHORIZED)
        ;; Bound check
        (asserts! (< index (get nft-count bundle)) ERR_INVALID_BUNDLE)
        
        ;; Map the NFT to the bundle slot
        (map-set bundle-nfts
            { bundle-id: bundle-id, index: index }
            {
                nft-contract: nft-contract,
                token-id: token-id
            }
        )
        
        ;; Event emission
        (print { event: "add-nft-to-bundle", bundle-id: bundle-id, index: index, nft-contract: nft-contract, token-id: token-id })
        
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
