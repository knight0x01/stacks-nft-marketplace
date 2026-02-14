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

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; @desc Configure the royalty for a specific NFT
;; @param nft-contract: The SIP-009 principal
;; @param token-id: The specific token ID
;; @param percentage: Royalty in basis points (e.g., 250 = 2.5%, max 1000 = 10%)
(define-public (set-royalty (nft-contract principal) (token-id uint) (percentage uint))
    (begin
        ;; Validate percentage limit
        (asserts! (<= percentage u1000) ERR_INVALID_PERCENTAGE) 
        
        ;; Record royalty mapping
        (map-set royalties
            { nft-contract: nft-contract, token-id: token-id }
            {
                creator: tx-sender,
                percentage: percentage
            }
        )
        
        ;; Event emission
        (print { event: "set-royalty", nft-contract: nft-contract, token-id: token-id, creator: tx-sender, percentage: percentage })
        
        (ok true)
    )
)

;; @desc Process royalty payment for a sale (usually called by marketplace)
;; @param nft-contract: The SIP-009 principal
;; @param token-id: The specific token ID
;; @param sale-price: The total STX sale price
(define-public (pay-royalty (nft-contract principal) (token-id uint) (sale-price uint))
    (let
        (
            (royalty-info (unwrap! (map-get? royalties { nft-contract: nft-contract, token-id: token-id }) ERR_NOT_FOUND))
            (royalty-amount (/ (* sale-price (get percentage royalty-info)) u10000))
        )
        ;; Only transfer if the amount is greater than zero
        (if (> royalty-amount u0)
            (try! (stx-transfer? royalty-amount tx-sender (get creator royalty-info)))
            true
        )
        
        ;; Event emission
        (print { event: "pay-royalty", nft-contract: nft-contract, token-id: token-id, amount: royalty-amount, recipient: (get creator royalty-info) })
        
        (ok royalty-amount)
    )
)
