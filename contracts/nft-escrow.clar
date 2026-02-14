;; ---------------------------------------------------------
;; NFT Escrow Contract
;; ---------------------------------------------------------
;; This contract provides a secure escrow mechanism for NFT trades.
;; It ensures that STX is locked before an NFT transfer is finalized.
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
;; Error Codes
(define-constant ERR_NOT_FOUND (err u300))
(define-constant ERR_UNAUTHORIZED (err u301))
(define-constant ERR_ALREADY_COMPLETED (err u302))
(define-constant ERR_NOT_READY (err u303))

(define-data-var escrow-nonce uint u0)

(define-map escrows
    { escrow-id: uint }
    {
        nft-contract: principal,
        token-id: uint,
        seller: principal,
        buyer: principal,
        price: uint,
        nft-deposited: bool,
        stx-deposited: bool,
        completed: bool
    }
)

(define-read-only (get-escrow (escrow-id uint))
    (map-get? escrows { escrow-id: escrow-id })
)

(define-public (create-escrow (nft-contract principal) (token-id uint) (buyer principal) (price uint))
    (let
        (
            (new-id (+ (var-get escrow-nonce) u1))
        )
        (map-set escrows
            { escrow-id: new-id }
            {
                nft-contract: nft-contract,
                token-id: token-id,
                seller: tx-sender,
                buyer: buyer,
                price: price,
                nft-deposited: false,
                stx-deposited: false,
                completed: false
            }
        )
        (var-set escrow-nonce new-id)
        (ok new-id)
    )
)

(define-public (deposit-stx (escrow-id uint))
    (let
        (
            (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND))
        )
        (asserts! (is-eq tx-sender (get buyer escrow)) ERR_UNAUTHORIZED)
        (asserts! (not (get completed escrow)) ERR_ALREADY_COMPLETED)
        
        ;; Transfer STX to contract
        (try! (stx-transfer? (get price escrow) tx-sender (as-contract tx-sender)))
        
        ;; Update escrow
        (map-set escrows
            { escrow-id: escrow-id }
            (merge escrow { stx-deposited: true })
        )
        (ok true)
    )
)

(define-public (complete-escrow (escrow-id uint))
    (let
        (
            (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND))
        )
        (asserts! (not (get completed escrow)) ERR_ALREADY_COMPLETED)
        (asserts! (get stx-deposited escrow) ERR_NOT_READY)
        
        ;; Transfer STX to seller
        (try! (as-contract (stx-transfer? (get price escrow) (as-contract tx-sender) (get seller escrow))))
        
        ;; Mark as completed
        (map-set escrows
            { escrow-id: escrow-id }
            (merge escrow { completed: true })
        )
        (ok true)
    )
)

(define-public (emergency-cancel (escrow-id uint))
    (let
        (
            (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR_NOT_FOUND))
        )
        (asserts! (or (is-eq tx-sender (get seller escrow)) (is-eq tx-sender (get buyer escrow))) ERR_UNAUTHORIZED)
        (asserts! (not (get completed escrow)) ERR_ALREADY_COMPLETED)
        
        ;; Refund STX if deposited
        (if (get stx-deposited escrow)
            (try! (as-contract (stx-transfer? (get price escrow) tx-sender (get buyer escrow))))
            true
        )
        
        ;; Mark as completed
        (map-set escrows
            { escrow-id: escrow-id }
            (merge escrow { completed: true })
        )
        (ok true)
    )
)
