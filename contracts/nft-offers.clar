;; nft-offers.clar
;; Offer system for NFTs allowing users to make offers on any NFT

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-not-found (err u401))
(define-constant err-unauthorized (err u402))
(define-constant err-expired (err u403))
(define-constant err-invalid-amount (err u404))
(define-constant err-offer-exists (err u405))

;; Data Variables
(define-data-var offer-nonce uint u0)

;; Data Maps
(define-map offers
    { offer-id: uint }
    {
        nft-contract: principal,
        token-id: uint,
        offerer: principal,
        amount: uint,
        expiration: uint,
        active: bool
    }
)

(define-map nft-offers
    { nft-contract: principal, token-id: uint }
    (list 20 uint)
)

(define-map user-offers
    { user: principal }
    (list 50 uint)
)

;; Read-only functions
(define-read-only (get-offer (offer-id uint))
    (map-get? offers { offer-id: offer-id })
)

(define-read-only (get-nft-offers (nft-contract principal) (token-id uint))
    (default-to (list) (map-get? nft-offers { nft-contract: nft-contract, token-id: token-id }))
)

(define-read-only (get-user-offers (user principal))
    (default-to (list) (map-get? user-offers { user: user }))
)

;; Public functions
(define-public (create-offer (nft-contract principal) (token-id uint) (amount uint) (duration uint))
    (let
        (
            (new-id (+ (var-get offer-nonce) u1))
            (expiration (+ block-height duration))
        )
        (asserts! (> amount u0) err-invalid-amount)
        
        ;; Lock STX
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        ;; Store offer
        (map-set offers
            { offer-id: new-id }
            {
                nft-contract: nft-contract,
                token-id: token-id,
                offerer: tx-sender,
                amount: amount,
                expiration: expiration,
                active: true
            }
        )
        
        (var-set offer-nonce new-id)
        (ok new-id)
    )
)

(define-public (accept-offer (offer-id uint))
    (let
        (
            (offer (unwrap! (map-get? offers { offer-id: offer-id }) err-not-found))
        )
        (asserts! (get active offer) err-not-found)
        (asserts! (< block-height (get expiration offer)) err-expired)
        
        ;; Transfer STX to NFT owner (tx-sender)
        (try! (as-contract (stx-transfer? (get amount offer) tx-sender tx-sender)))
        
        ;; Mark offer as inactive
        (map-set offers
            { offer-id: offer-id }
            (merge offer { active: false })
        )
        (ok true)
    )
)

(define-public (cancel-offer (offer-id uint))
    (let
        (
            (offer (unwrap! (map-get? offers { offer-id: offer-id }) err-not-found))
        )
        (asserts! (is-eq tx-sender (get offerer offer)) err-unauthorized)
        (asserts! (get active offer) err-not-found)
        
        ;; Refund STX
        (try! (as-contract (stx-transfer? (get amount offer) tx-sender (get offerer offer))))
        
        ;; Mark offer as inactive
        (map-set offers
            { offer-id: offer-id }
            (merge offer { active: false })
        )
        (ok true)
    )
)

(define-public (reject-offer (offer-id uint))
    (let
        (
            (offer (unwrap! (map-get? offers { offer-id: offer-id }) err-not-found))
        )
        (asserts! (get active offer) err-not-found)
        
        ;; Refund STX to offerer
        (try! (as-contract (stx-transfer? (get amount offer) tx-sender (get offerer offer))))
        
        ;; Mark offer as inactive
        (map-set offers
            { offer-id: offer-id }
            (merge offer { active: false })
        )
        (ok true)
    )
)
