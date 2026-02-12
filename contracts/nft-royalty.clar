;; nft-royalty.clar
;; NFT royalty management system

(define-constant err-unauthorized (err u400))
(define-constant err-invalid-percentage (err u401))
(define-constant err-not-found (err u402))

(define-map royalties
    { nft-contract: principal, token-id: uint }
    {
        creator: principal,
        percentage: uint
    }
)

(define-read-only (get-royalty (nft-contract principal) (token-id uint))
    (map-get? royalties { nft-contract: nft-contract, token-id: token-id })
)

(define-public (set-royalty (nft-contract principal) (token-id uint) (percentage uint))
    (begin
        (asserts! (<= percentage u1000) err-invalid-percentage) ;; Max 10%
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
            (royalty-info (unwrap! (map-get? royalties { nft-contract: nft-contract, token-id: token-id }) err-not-found))
            (royalty-amount (/ (* sale-price (get percentage royalty-info)) u10000))
        )
        (if (> royalty-amount u0)
            (try! (stx-transfer? royalty-amount tx-sender (get creator royalty-info)))
            true
        )
        (ok royalty-amount)
    )
)
