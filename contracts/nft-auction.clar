;; nft-auction.clar
;; English auction contract for NFTs

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-found (err u201))
(define-constant err-auction-active (err u202))
(define-constant err-auction-ended (err u203))
(define-constant err-bid-too-low (err u204))
(define-constant err-unauthorized (err u205))

(define-data-var auction-nonce uint u0)

(define-map auctions
    { auction-id: uint }
    {
        nft-contract: principal,
        token-id: uint,
        seller: principal,
        start-price: uint,
        highest-bid: uint,
        highest-bidder: (optional principal),
        end-block: uint,
        active: bool
    }
)

(define-read-only (get-auction (auction-id uint))
    (map-get? auctions { auction-id: auction-id })
)

(define-public (create-auction (nft-contract principal) (token-id uint) (start-price uint) (duration uint))
    (let
        (
            (new-id (+ (var-get auction-nonce) u1))
            (end-block (+ block-height duration))
        )
        (map-set auctions
            { auction-id: new-id }
            {
                nft-contract: nft-contract,
                token-id: token-id,
                seller: tx-sender,
                start-price: start-price,
                highest-bid: u0,
                highest-bidder: none,
                end-block: end-block,
                active: true
            }
        )
        (var-set auction-nonce new-id)
        (ok new-id)
    )
)

(define-public (place-bid (auction-id uint) (bid-amount uint))
    (let
        (
            (auction (unwrap! (map-get? auctions { auction-id: auction-id }) err-not-found))
        )
        (asserts! (get active auction) err-auction-ended)
        (asserts! (< block-height (get end-block auction)) err-auction-ended)
        (asserts! (> bid-amount (get highest-bid auction)) err-bid-too-low)
        (asserts! (>= bid-amount (get start-price auction)) err-bid-too-low)
        
        ;; Return previous bid if exists
        (match (get highest-bidder auction)
            prev-bidder (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender prev-bidder)))
            true
        )
        
        ;; Lock new bid
        (try! (stx-transfer? bid-amount tx-sender (as-contract tx-sender)))
        
        ;; Update auction
        (map-set auctions
            { auction-id: auction-id }
            (merge auction {
                highest-bid: bid-amount,
                highest-bidder: (some tx-sender)
            })
        )
        (ok true)
    )
)

(define-public (finalize-auction (auction-id uint))
    (let
        (
            (auction (unwrap! (map-get? auctions { auction-id: auction-id }) err-not-found))
        )
        (asserts! (get active auction) err-not-found)
        (asserts! (>= block-height (get end-block auction)) err-auction-active)
        
        ;; Transfer STX to seller if there was a bid
        (match (get highest-bidder auction)
            winner (try! (as-contract (stx-transfer? (get highest-bid auction) (as-contract tx-sender) (get seller auction))))
            true
        )
        
        ;; Mark auction as inactive
        (map-set auctions
            { auction-id: auction-id }
            (merge auction { active: false })
        )
        (ok true)
    )
)
