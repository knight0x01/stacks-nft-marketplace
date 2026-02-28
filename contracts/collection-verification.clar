;; ---------------------------------------------------------
;; Collection Verification Contract
;;  
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------

(define-constant CONTRACT_OWNER tx-sender)

(define-constant ERR_OWNER_ONLY (err u500))
(define-constant ERR_ALREADY_VERIFIED (err u501))
(define-constant ERR_NOT_VERIFIED (err u502))
(define-constant ERR_ALREADY_REQUESTED (err u503))
(define-constant ERR_REQUEST_NOT_FOUND (err u504))

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------

(define-data-var verification-fee uint u1000000)

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

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

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

(define-read-only (is-verified (collection principal))
  (match (map-get? verified-collections { collection: collection })
    data (get verified data)
    false
  )
)

(define-read-only (get-verification-info (collection principal))
  (map-get? verified-collections { collection: collection })
)

(define-read-only (get-verification-fee)
  (ok (var-get verification-fee))
)

(define-read-only (get-request-status (collection principal))
  (match (map-get? verification-requests { collection: collection })
    request (some (get status request))
    none
  )
)

;; ---------------------------------------------------------
;; Request Verification
;; ---------------------------------------------------------

(define-public (request-verification (collection principal) (metadata-uri (string-ascii 256)))
  (begin

    (asserts! (not (is-verified collection)) ERR_ALREADY_VERIFIED)

    (asserts!
      (is-none (map-get? verification-requests { collection: collection }))
      ERR_ALREADY_REQUESTED
    )

    (let ((fee (var-get verification-fee)))

      (try! (stx-transfer? fee tx-sender CONTRACT_OWNER))

      (map-set verification-requests
        { collection: collection }
        {
          requester: tx-sender,
          requested-at: burn-block-height,
          status: "pending"
        }
      )

      (print {
        type: "verification",
        action: "fee-paid",
        collection: collection,
        payer: tx-sender,
        amount: fee,
        block: burn-block-height
      })

      (print {
        type: "verification",
        action: "requested",
        collection: collection,
        requester: tx-sender,
        metadata-uri: metadata-uri,
        block: burn-block-height
      })

      (ok true)
    )
  )
)

;; ---------------------------------------------------------
;; Approve Verification (Admin)
;; ---------------------------------------------------------

(define-public (verify-collection (collection principal) (metadata-uri (string-ascii 256)))
  (begin

    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)

    (let ((existing (map-get? verified-collections { collection: collection })))

      (map-set verified-collections
        { collection: collection }
        {
          verified: true,
          verified-at: burn-block-height,
          verifier: tx-sender,
          metadata-uri: metadata-uri
        }
      )

      ;; Update request status if exists
      (begin
        (match (map-get? verification-requests { collection: collection })
          request
          (begin
            (map-set verification-requests
              { collection: collection }
              (merge request { status: "approved" })
            )

            (print {
              type: "verification",
              action: "status-updated",
              collection: collection,
              old-status: (get status request),
              new-status: "approved",
              actor: tx-sender,
              block: burn-block-height
            })

            true
          )
          true
        )
      )

      ;; Overwrite detection
      (begin
        (match existing
          data
          (begin
            (print {
              type: "verification",
              action: "overwritten",
              collection: collection,
              previous-verifier: (get verifier data),
              new-verifier: tx-sender,
              block: burn-block-height
            })
            true
          )
          true
        )
      )

      (print {
        type: "verification",
        action: "approved",
        collection: collection,
        verifier: tx-sender,
        metadata-uri: metadata-uri,
        block: burn-block-height
      })

      (ok true)
    )
  )
)

;; ---------------------------------------------------------
;; Reject Verification (Admin)
;; ---------------------------------------------------------

(define-public (reject-verification (collection principal) (reason (string-ascii 100)))
  (begin

    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)

    (match (map-get? verification-requests { collection: collection })
      request
      (begin
        (map-set verification-requests
          { collection: collection }
          (merge request { status: "rejected" })
        )

        (print {
          type: "verification",
          action: "rejected",
          collection: collection,
          rejected-by: tx-sender,
          reason: reason,
          block: burn-block-height
        })

        (ok true)
      )
      ERR_REQUEST_NOT_FOUND
    )
  )
)

;; ---------------------------------------------------------
;; Revoke Verification (Admin)
;; ---------------------------------------------------------

(define-public (revoke-verification (collection principal))
  (begin

    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (asserts! (is-verified collection) ERR_NOT_VERIFIED)

    (let (
        (existing (unwrap! (map-get? verified-collections { collection: collection }) ERR_NOT_VERIFIED))
      )

      (map-set verified-collections
        { collection: collection }
        {
          verified: false,
          verified-at: burn-block-height,
          verifier: tx-sender,
          metadata-uri: ""
        }
      )

      (print {
        type: "verification",
        action: "revoked",
        collection: collection,
        previous-verifier: (get verifier existing),
        revoked-by: tx-sender,
        block: burn-block-height
      })

      (ok true)
    )
  )
)

;; ---------------------------------------------------------
;; Update Verification Fee (Admin)
;; ---------------------------------------------------------

(define-public (set-verification-fee (new-fee uint))
  (begin

    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)

    (let ((old-fee (var-get verification-fee)))

      (var-set verification-fee new-fee)

      (print {
        type: "verification",
        action: "fee-updated",
        old-fee: old-fee,
        new-fee: new-fee,
        updated-by: tx-sender,
        block: burn-block-height
      })

      (ok true)
    )
  )
)
