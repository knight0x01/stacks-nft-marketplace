;; ---------------------------------------------------------
;; NFT Offer System
;; ---------------------------------------------------------
;; This contract allows users to place custom STX offers on any SIP-009 NFT.
;; Offers lock STX in the contract and specify an expiration block.
;; Owners can accept, reject or ignore offers. Offerers can cancel.
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
(define-constant CONTRACT_OWNER tx-sender)

;; Error Codes
(define-constant ERR_OWNER_ONLY (err u400))
(define-constant ERR_NOT_FOUND (err u401))
(define-constant ERR_UNAUTHORIZED (err u402))
(define-constant ERR_EXPIRED (err u403))
(define-constant ERR_INVALID_AMOUNT (err u404))
(define-constant ERR_OFFER_EXISTS (err u405))

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------

;; Counter for generating unique offer IDs
(define-data-var offer-nonce uint u0)

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Store all details for each specific offer
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

;; Track IDs of all offers made on a specific NFT (max 20)
(define-map nft-offers
    { nft-contract: principal, token-id: uint }
    (list 20 uint)
)

;; Track IDs of all offers made by a specific user (max 50)
(define-map user-offers
    { user: principal }
    (list 50 uint)
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

;; Retrieve full details for a specific offer
(define-read-only (get-offer (offer-id uint))
    (map-get? offers { offer-id: offer-id })
)

;; Get list of all offer IDs for a specific NFT
(define-read-only (get-nft-offers (nft-contract principal) (token-id uint))
    (default-to (list) (map-get? nft-offers { nft-contract: nft-contract, token-id: token-id }))
)

;; Get list of all offer IDs created by a specific user
(define-read-only (get-user-offers (user principal))
    (default-to (list) (map-get? user-offers { user: user }))
)

;; Helper to check if a specific offer is still active
(define-read-only (is-offer-active (offer-id uint))
    (match (get-offer offer-id)
        offer (get active offer)
        false
    )
)

;; Public functions
(define-public (create-offer (nft-contract principal) (token-id uint) (amount uint) (duration uint))
    (let
        (
            (new-id (+ (var-get offer-nonce) u1))
            (expiration (+ block-height duration))
        )
        (asserts! (> amount u0) ERR_INVALID_AMOUNT)
        
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
            (offer (unwrap! (map-get? offers { offer-id: offer-id }) ERR_NOT_FOUND))
        )
        (asserts! (get active offer) ERR_NOT_FOUND)
        (asserts! (< block-height (get expiration offer)) ERR_EXPIRED)
        
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
            (offer (unwrap! (map-get? offers { offer-id: offer-id }) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (get offerer offer)) ERR_UNAUTHORIZED)
        (asserts! (get active offer) ERR_NOT_FOUND)
        
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
            (offer (unwrap! (map-get? offers { offer-id: offer-id }) ERR_NOT_FOUND))
        )
        (asserts! (get active offer) ERR_NOT_FOUND)
        
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
