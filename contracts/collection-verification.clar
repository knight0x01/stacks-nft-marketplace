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

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------

;; The fee required to request collection verification (in micro-STX)
(define-data-var verification-fee uint u1000000) ;; Default 1 STX

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Store details of verified NFT collections
(define-map verified-collections
    { collection: principal }
    {
        verified: bool,
        verified-at: uint,
        verifier: principal,
        metadata-uri: (string-ascii 256)
    }
)

;; Store pending and processed verification requests
(define-map verification-requests
    { collection: principal }
    {
        requester: principal,
        requested-at: uint,
        status: (string-ascii 20)
    }
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

;; Check if a collection principal is currently verified
(define-read-only (is-verified (collection principal))
    (match (map-get? verified-collections { collection: collection })
        verified-data (get verified verified-data)
        false
    )
)

;; Get full verification details for a specific collection
(define-read-only (get-verification-info (collection principal))
    (map-get? verified-collections { collection: collection })
)

;; Get the current fee for requesting a verification
(define-read-only (get-verification-fee)
    (ok (var-get verification-fee))
)

;; Helper to retrieve the current status of a verification request
(define-read-only (get-request-status (collection principal))
    (match (map-get? verification-requests { collection: collection })
        request (some (get status request))
        none
    )
)

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; @desc Submit a request to have a collection verified
;; @param collection: The principal of the NFT collection contract
;; @param metadata-uri: External link to collection metadata
(define-public (request-verification (collection principal) (metadata-uri (string-ascii 256)))
    (begin
        ;; Validate that it's not already verified
        (asserts! (is-none (map-get? verified-collections { collection: collection })) ERR_ALREADY_VERIFIED)
        
        ;; Payout the verification fee to the contract owner
        (try! (stx-transfer? (var-get verification-fee) tx-sender CONTRACT_OWNER))
        
        ;; Save the request state
        (map-set verification-requests
            { collection: collection }
            {
                requester: tx-sender,
                requested-at: block-height,
                status: "pending"
            }
        )
        
        ;; Event emission
        (print { event: "request-verification", collection: collection, requester: tx-sender })
        (ok true)
    )
)

;; @desc Approve a collection verification (Admin only)
;; @param collection: The principal of the collection
;; @param metadata-uri: The verified metadata URI
(define-public (verify-collection (collection principal) (metadata-uri (string-ascii 256)))
    (begin
        ;; Admin authorization
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        
        ;; Mark as verified
        (map-set verified-collections
            { collection: collection }
            {
                verified: true,
                verified-at: block-height,
                verifier: tx-sender,
                metadata-uri: metadata-uri
            }
        )
        
        ;; Update the request status if it exists
        (match (map-get? verification-requests { collection: collection })
            request (map-set verification-requests
                { collection: collection }
                (merge request { status: "approved" })
            )
            true
        )
        
        ;; Event emission
        (print { event: "verify-collection", collection: collection, verifier: tx-sender })
        (ok true)
    )
)

;; @desc Revoke a previously granted verification (Admin only)
;; @param collection: The principal of the collection
(define-public (revoke-verification (collection principal))
    (begin
        ;; Admin check
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        ;; Existence check
        (asserts! (is-verified collection) ERR_NOT_VERIFIED)
        
        ;; Mark as unverified
        (map-set verified-collections
            { collection: collection }
            {
                verified: false,
                verified-at: block-height,
                verifier: tx-sender,
                metadata-uri: ""
            }
        )
        
        ;; Event emission
        (print { event: "revoke-verification", collection: collection, revoked-by: tx-sender })
        (ok true)
    )
)

;; Admin functions
(define-public (set-verification-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        (var-set verification-fee new-fee)
        (ok true)
    )
)
