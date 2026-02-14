;; ---------------------------------------------------------
;; NFT Whitelist Contract
;; ---------------------------------------------------------
;; This contract manages whitelists for exclusive NFT sales.
;; It allows creators to restrict purchases to specific users
;; during a predefined block window.
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
(define-constant CONTRACT_OWNER tx-sender)

;; Error Codes
(define-constant ERR_OWNER_ONLY (err u600))
(define-constant ERR_NOT_WHITELISTED (err u601))
(define-constant ERR_WHITELIST_EXPIRED (err u602))

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------

;; Counter for generating unique whitelist IDs
(define-data-var whitelist-nonce uint u0)

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Store general configuration for each whitelist
(define-map whitelists
    { whitelist-id: uint }
    {
        name: (string-ascii 50),
        end-block: uint,
        active: bool
    }
)

;; Store membership status for users in specific whitelists
(define-map whitelist-members
    { whitelist-id: uint, member: principal }
    bool
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

;; @desc Check if a user is part of a specific whitelist
;; @param whitelist-id: The unique ID of the whitelist
;; @param member: The principal to check
(define-read-only (is-whitelisted (whitelist-id uint) (member principal))
    (default-to false (map-get? whitelist-members { whitelist-id: whitelist-id, member: member }))
)

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; @desc Create a new whitelist (Admin only)
;; @param name: Descriptive name for the whitelist
;; @param duration: Length of time the whitelist remains active
(define-public (create-whitelist (name (string-ascii 50)) (duration uint))
    (let
        (
            (new-id (+ (var-get whitelist-nonce) u1))
        )
        ;; Admin check
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        
        ;; Save whitelist definition
        (map-set whitelists
            { whitelist-id: new-id }
            {
                name: name,
                end-block: (+ block-height duration),
                active: true
            }
        )
        
        ;; Update nonce
        (var-set whitelist-nonce new-id)
        
        ;; Event emission
        (print { event: "create-whitelist", whitelist-id: new-id, creator: tx-sender, name: name })
        
        (ok new-id)
    )
)

;; @desc Add a member to a specific whitelist (Admin only)
;; @param whitelist-id: The unique ID of the whitelist
;; @param member: The principal to add
(define-public (add-to-whitelist (whitelist-id uint) (member principal))
    (begin
        ;; Admin check
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        
        ;; Save membership
        (map-set whitelist-members
            { whitelist-id: whitelist-id, member: member }
            true
        )
        
        ;; Event emission
        (print { event: "add-to-whitelist", whitelist-id: whitelist-id, member: member, added-by: tx-sender })
        
        (ok true)
    )
)

;; @desc Remove a member from a specific whitelist (Admin only)
;; @param whitelist-id: The unique ID of the whitelist
;; @param member: The principal to remove
(define-public (remove-from-whitelist (whitelist-id uint) (member principal))
    (begin
        ;; Admin check
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        
        ;; Remove membership record
        (map-delete whitelist-members { whitelist-id: whitelist-id, member: member })
        
        ;; Event emission
        (print { event: "remove-from-whitelist", whitelist-id: whitelist-id, member: member, removed-by: tx-sender })
        
        (ok true)
    )
)
