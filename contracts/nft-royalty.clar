;; ---------------------------------------------------------
;; NFT Royalty Contract
;; ---------------------------------------------------------
;; This contract manages the distribution of secondary sale
;; royalties to NFT creators. It supports setting royalty
;; percentages and processing payments.
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
;; Error Codes
(define-constant ERR_UNAUTHORIZED (err u400))
(define-constant ERR_INVALID_PERCENTAGE (err u401))
(define-constant ERR_NOT_FOUND (err u402))

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Store creator address and royalty percentage (basis points) for each NFT
(define-map royalties
    { nft-contract: principal, token-id: uint }
    {
        creator: principal,
        percentage: uint
    }
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

;; @desc Retrieve the royalty configuration for a specific NFT
;; @param nft-contract: The SIP-009 principal
;; @param token-id: The specific token ID
(define-read-only (get-royalty (nft-contract principal) (token-id uint))
    (map-get? royalties { nft-contract: nft-contract, token-id: token-id })
)

(define-public (set-royalty (nft-contract principal) (token-id uint) (percentage uint))
    (begin
        (asserts! (<= percentage u1000) ERR_INVALID_PERCENTAGE) ;; Max 10%
        (map-set royalties
            { nft-contract: nft-contract, token-id: token-id }
            {
                creator: tx-sender,
                percentage: percentage
            }
        )
        (ok true)
    )
)

(define-public (pay-royalty (nft-contract principal) (token-id uint) (sale-price uint))
    (let
        (
            (royalty-info (unwrap! (map-get? royalties { nft-contract: nft-contract, token-id: token-id }) ERR_NOT_FOUND))
            (royalty-amount (/ (* sale-price (get percentage royalty-info)) u10000))
        )
        (if (> royalty-amount u0)
            (try! (stx-transfer? royalty-amount tx-sender (get creator royalty-info)))
            true
        )
        (ok royalty-amount)
    )
)
