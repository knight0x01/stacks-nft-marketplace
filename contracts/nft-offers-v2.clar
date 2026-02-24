;; NFT Offers - Production Ready
;; Make and accept offers on any NFT

(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.sip-009-nft-trait.sip-009-nft-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_EXPIRED (err u102))
(define-constant ERR_ALREADY_ACCEPTED (err u103))
(define-constant ERR_INVALID_AMOUNT (err u104))

(define-constant MIN_OFFER u1000000) ;; 1 STX
(define-constant MAX_EXPIRY u4320) ;; ~30 days

;; Data Variables
(define-data-var offer-id-nonce uint u0)
(define-data-var platform-fee uint u250) ;; 2.5%

;; Data Maps
(define-map offers
    uint
    {
        nft-contract: principal,
        token-id: uint,
        offerer: principal,
        amount: uint,
        expiry: uint,
        accepted: bool
    }
)

(define-map nft-offers { nft-contract: principal, token-id: uint, offerer: principal } uint)
(define-map user-offers { offerer: principal, offer-id: uint } bool)

;; Read-Only Functions
(define-read-only (get-offer (id uint))
    (ok (map-get? offers id))
)

(define-read-only (get-nft-offer (nft-contract principal) (token-id uint) (offerer principal))
    (ok (map-get? nft-offers { nft-contract: nft-contract, token-id: token-id, offerer: offerer }))
)

(define-read-only (is-offer-valid (id uint))
    (match (map-get? offers id)
        offer (ok (and 
            (not (get accepted offer))
            (<= block-height (get expiry offer))
        ))
        (ok false)
    )
)

;; Public Functions
(define-public (make-offer
    (nft-contract principal)
    (token-id uint)
    (amount uint)
    (expiry uint))
    (let ((offer-id (+ (var-get offer-id-nonce) u1)))
        (asserts! (>= amount MIN_OFFER) ERR_INVALID_AMOUNT)
        (asserts! (and (> expiry block-height) (<= (- expiry block-height) MAX_EXPIRY)) ERR_EXPIRED)
        
        ;; Lock funds in contract
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        
        (map-set offers offer-id {
            nft-contract: nft-contract,
            token-id: token-id,
            offerer: tx-sender,
            amount: amount,
            expiry: expiry,
            accepted: false
        })
        
        (map-set nft-offers { nft-contract: nft-contract, token-id: token-id, offerer: tx-sender } offer-id)
        (map-set user-offers { offerer: tx-sender, offer-id: offer-id } true)
        (var-set offer-id-nonce offer-id)
        
        (print { event: "make-offer", offer-id: offer-id, amount: amount })
        (ok offer-id)
    )
)

(define-public (accept-offer (nft-contract <nft-trait>) (offer-id uint))
    (let ((offer (unwrap! (map-get? offers offer-id) ERR_NOT_FOUND)))
        (asserts! (not (get accepted offer)) ERR_ALREADY_ACCEPTED)
        (asserts! (<= block-height (get expiry offer)) ERR_EXPIRED)
        
        ;; Calculate fee
        (let (
            (fee (/ (* (get amount offer) (var-get platform-fee)) u10000))
            (seller-amount (- (get amount offer) fee))
        )
            ;; Transfer payment to seller
            (try! (as-contract (stx-transfer? seller-amount tx-sender tx-sender)))
            (try! (as-contract (stx-transfer? fee tx-sender CONTRACT_OWNER)))
            
            ;; Transfer NFT to offerer
            (try! (contract-call? nft-contract transfer (get token-id offer) tx-sender (get offerer offer)))
        )
        
        ;; Mark as accepted
        (map-set offers offer-id (merge offer { accepted: true }))
        (map-delete nft-offers { 
            nft-contract: (get nft-contract offer), 
            token-id: (get token-id offer), 
            offerer: (get offerer offer) 
        })
        
        (print { event: "accept-offer", offer-id: offer-id, seller: tx-sender })
        (ok true)
    )
)

(define-public (cancel-offer (offer-id uint))
    (let ((offer (unwrap! (map-get? offers offer-id) ERR_NOT_FOUND)))
        (asserts! (is-eq tx-sender (get offerer offer)) ERR_UNAUTHORIZED)
        (asserts! (not (get accepted offer)) ERR_ALREADY_ACCEPTED)
        
        ;; Refund offerer
        (try! (as-contract (stx-transfer? (get amount offer) tx-sender (get offerer offer))))
        
        (map-set offers offer-id (merge offer { accepted: true }))
        (map-delete nft-offers { 
            nft-contract: (get nft-contract offer), 
            token-id: (get token-id offer), 
            offerer: (get offerer offer) 
        })
        
        (print { event: "cancel-offer", offer-id: offer-id })
        (ok true)
    )
)

(define-public (withdraw-expired-offer (offer-id uint))
    (let ((offer (unwrap! (map-get? offers offer-id) ERR_NOT_FOUND)))
        (asserts! (is-eq tx-sender (get offerer offer)) ERR_UNAUTHORIZED)
        (asserts! (> block-height (get expiry offer)) ERR_UNAUTHORIZED)
        (asserts! (not (get accepted offer)) ERR_ALREADY_ACCEPTED)
        
        ;; Refund offerer
        (try! (as-contract (stx-transfer? (get amount offer) tx-sender (get offerer offer))))
        
        (map-set offers offer-id (merge offer { accepted: true }))
        (print { event: "withdraw-expired-offer", offer-id: offer-id })
        (ok true)
    )
)
