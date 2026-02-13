;; nft-whitelist.clar
;; Whitelist functionality for exclusive NFT sales

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u600))
(define-constant err-not-whitelisted (err u601))
(define-constant err-whitelist-expired (err u602))

(define-map whitelists
    { whitelist-id: uint }
    {
        name: (string-ascii 50),
        end-block: uint,
        active: bool
    }
)

(define-map whitelist-members
    { whitelist-id: uint, member: principal }
    bool
)

(define-data-var whitelist-nonce uint u0)

(define-read-only (is-whitelisted (whitelist-id uint) (member principal))
    (default-to false (map-get? whitelist-members { whitelist-id: whitelist-id, member: member }))
)

(define-public (create-whitelist (name (string-ascii 50)) (duration uint))
    (let
        (
            (new-id (+ (var-get whitelist-nonce) u1))
        )
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        
        (map-set whitelists
            { whitelist-id: new-id }
            {
                name: name,
                end-block: (+ block-height duration),
                active: true
            }
        )
        (var-set whitelist-nonce new-id)
        (ok new-id)
    )
)

(define-public (add-to-whitelist (whitelist-id uint) (member principal))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (map-set whitelist-members
            { whitelist-id: whitelist-id, member: member }
            true
        )
        (ok true)
    )
)

(define-public (remove-from-whitelist (whitelist-id uint) (member principal))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (map-delete whitelist-members { whitelist-id: whitelist-id, member: member })
        (ok true)
    )
)
