;; example-nft.clar
;; Example NFT collection implementing SIP-009

(impl-trait .sip-009-nft-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token example-nft uint)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-exists (err u102))
(define-constant err-not-found (err u103))

;; Data Variables
(define-data-var last-token-id uint u0)
(define-data-var base-uri (string-ascii 256) "https://example.com/metadata/")

;; SIP-009 Functions
(define-read-only (get-last-token-id)
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
    (ok (some (var-get base-uri)))
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? example-nft token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
        (nft-transfer? example-nft token-id sender recipient)
    )
)

;; Minting function
(define-public (mint (recipient principal))
    (let
        (
            (token-id (+ (var-get last-token-id) u1))
        )
        (try! (nft-mint? example-nft token-id recipient))
        (var-set last-token-id token-id)
        (ok token-id)
    )
)

;; Admin function to update base URI
(define-public (set-base-uri (new-base-uri (string-ascii 256)))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (var-set base-uri new-base-uri)
        (ok true)
    )
)
