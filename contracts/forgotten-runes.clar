;; forgotten-runes.clar
;; Popular NFT Collection: Forgotten Runes Warrior Guild
;; Implementation of SIP-009

(impl-trait .sip-009-nft-trait.nft-trait)

(define-non-fungible-token forgotten-runes uint)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_TOKEN_EXISTS (err u102))
(define-constant ERR_NOT_FOUND (err u103))

(define-data-var last-token-id uint u0)
(define-data-var base-uri (string-ascii 256) "https://forgottenrunes.com/api/")

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
    (ok (some (var-get base-uri)))
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? forgotten-runes token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
        (nft-transfer? forgotten-runes token-id sender recipient)
    )
)

(define-public (mint (recipient principal))
    (let
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        (try! (nft-mint? forgotten-runes token-id recipient))
        (var-set last-token-id token-id)
        (print { event: "mint", recipient: recipient, token-id: token-id })
        (ok token-id)
    )
)

(define-public (set-base-uri (new-base-uri (string-ascii 256)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        (var-set base-uri new-base-uri)
        (ok true)
    )
)
