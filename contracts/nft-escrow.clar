;; nft-escrow.clar
;; Secure escrow for NFT trades

(define-constant err-not-found (err u300))
(define-constant err-unauthorized (err u301))
(define-constant err-already-completed (err u302))
(define-constant err-not-ready (err u303))

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
            (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) err-not-found))
        )
        (asserts! (is-eq tx-sender (get buyer escrow)) err-unauthorized)
        (asserts! (not (get completed escrow)) err-already-completed)
        
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
            (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) err-not-found))
        )
        (asserts! (not (get completed escrow)) err-already-completed)
        (asserts! (get stx-deposited escrow) err-not-ready)
        
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
            (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) err-not-found))
        )
        (asserts! (or (is-eq tx-sender (get seller escrow)) (is-eq tx-sender (get buyer escrow))) err-unauthorized)
        (asserts! (not (get completed escrow)) err-already-completed)
        
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
