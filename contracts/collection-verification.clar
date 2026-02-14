;; ---------------------------------------------------------
;; Collection Verification Contract
;; ---------------------------------------------------------
;; This contract defines a trust layer for the NFT marketplace.
;; It allows the contract owner to verify and revoke verification for
;; specific NFT collections, providing a 'blue checkmark' system.
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
(define-constant CONTRACT_OWNER tx-sender)

;; Error Codes
(define-constant ERR_OWNER_ONLY (err u500))
(define-constant ERR_NOT_FOUND (err u501))
(define-constant ERR_ALREADY_VERIFIED (err u502))
(define-constant ERR_NOT_VERIFIED (err u503))

;; Data Variables
(define-data-var verification-fee uint u1000000) ;; 1 STX

;; Data Maps
(define-map verified-collections
    { collection: principal }
    {
        verified: bool,
        verified-at: uint,
        verifier: principal,
        metadata-uri: (string-ascii 256)
    }
)

(define-map verification-requests
    { collection: principal }
    {
        requester: principal,
        requested-at: uint,
        status: (string-ascii 20)
    }
)

;; Read-only functions
(define-read-only (is-verified (collection principal))
    (match (map-get? verified-collections { collection: collection })
        verified-data (get verified verified-data)
        false
    )
)

(define-read-only (get-verification-info (collection principal))
    (map-get? verified-collections { collection: collection })
)

(define-read-only (get-verification-fee)
    (ok (var-get verification-fee))
)

;; Public functions
(define-public (request-verification (collection principal) (metadata-uri (string-ascii 256)))
    (begin
        (asserts! (is-none (map-get? verified-collections { collection: collection })) err-already-verified)
        
        ;; Pay verification fee
        (try! (stx-transfer? (var-get verification-fee) tx-sender contract-owner))
        
        ;; Store verification request
        (map-set verification-requests
            { collection: collection }
            {
                requester: tx-sender,
                requested-at: block-height,
                status: "pending"
            }
        )
        (ok true)
    )
)

(define-public (verify-collection (collection principal) (metadata-uri (string-ascii 256)))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        
        (map-set verified-collections
            { collection: collection }
            {
                verified: true,
                verified-at: block-height,
                verifier: tx-sender,
                metadata-uri: metadata-uri
            }
        )
        
        ;; Update request status
        (match (map-get? verification-requests { collection: collection })
            request (map-set verification-requests
                { collection: collection }
                (merge request { status: "approved" })
            )
            true
        )
        (ok true)
    )
)

(define-public (revoke-verification (collection principal))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (is-verified collection) err-not-verified)
        
        (map-set verified-collections
            { collection: collection }
            {
                verified: false,
                verified-at: block-height,
                verifier: tx-sender,
                metadata-uri: ""
            }
        )
        (ok true)
    )
)

;; Admin functions
(define-public (set-verification-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (var-set verification-fee new-fee)
        (ok true)
    )
)
