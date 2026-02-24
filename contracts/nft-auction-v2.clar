;; NFT Auction - Production Ready
;; English auction with automatic bid refunds

(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.sip-009-nft-trait.sip-009-nft-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_AUCTION_ENDED (err u102))
(define-constant ERR_AUCTION_ACTIVE (err u103))
(define-constant ERR_BID_TOO_LOW (err u104))
(define-constant ERR_NO_BIDS (err u105))
(define-constant ERR_INVALID_DURATION (err u106))

(define-constant MIN_BID_INCREMENT u1000000) ;; 1 STX
(define-constant MIN_DURATION u144) ;; ~24 hours
(define-constant MAX_DURATION u4320) ;; ~30 days

;; Data Variables
(define-data-var auction-id-nonce uint u0)
(define-data-var platform-fee uint u250) ;; 2.5%

;; Data Maps
(define-map auctions
    uint
    {
        nft-contract: principal,
        token-id: uint,
        seller: principal,
        reserve-price: uint,
        end-block: uint,
        finalized: bool
    }
)

(define-map bids
    uint
    {
        bidder: principal,
        amount: uint,
        timestamp: uint
    }
)

(define-map user-bids { auction-id: uint, bidder: principal } uint)

;; Private Functions
(define-private (refund-previous-bidder (auction-id uint) (previous-bid (optional { bidder: principal, amount: uint, timestamp: uint })))
    (match previous-bid
        bid (stx-transfer? (get amount bid) (as-contract tx-sender) (get bidder bid))
        (ok true)
    )
)

;; Read-Only Functions
(define-read-only (get-auction (id uint))
    (ok (map-get? auctions id))
)

(define-read-only (get-current-bid (id uint))
    (ok (map-get? bids id))
)

(define-read-only (get-user-bid (auction-id uint) (bidder principal))
    (ok (map-get? user-bids { auction-id: auction-id, bidder: bidder }))
)

(define-read-only (is-auction-ended (id uint))
    (match (map-get? auctions id)
        auction (ok (>= block-height (get end-block auction)))
        (ok false)
    )
)

;; Public Functions
(define-public (create-auction
    (nft-contract <nft-trait>)
    (token-id uint)
    (reserve-price uint)
    (duration uint))
    (let (
        (auction-id (+ (var-get auction-id-nonce) u1))
        (end-block (+ block-height duration))
    )
        (asserts! (and (>= duration MIN_DURATION) (<= duration MAX_DURATION)) ERR_INVALID_DURATION)
        
        ;; Transfer NFT to contract
        (try! (contract-call? nft-contract transfer token-id tx-sender (as-contract tx-sender)))
        
        (map-set auctions auction-id {
            nft-contract: (contract-of nft-contract),
            token-id: token-id,
            seller: tx-sender,
            reserve-price: reserve-price,
            end-block: end-block,
            finalized: false
        })
        
        (var-set auction-id-nonce auction-id)
        (print { event: "create-auction", auction-id: auction-id, end-block: end-block })
        (ok auction-id)
    )
)

(define-public (place-bid (auction-id uint) (bid-amount uint))
    (let (
        (auction (unwrap! (map-get? auctions auction-id) ERR_NOT_FOUND))
        (current-bid (map-get? bids auction-id))
    )
        (asserts! (< block-height (get end-block auction)) ERR_AUCTION_ENDED)
        (asserts! (not (get finalized auction)) ERR_AUCTION_ENDED)
        
        ;; Validate bid amount
        (match current-bid
            existing-bid (asserts! (>= bid-amount (+ (get amount existing-bid) MIN_BID_INCREMENT)) ERR_BID_TOO_LOW)
            (asserts! (>= bid-amount (get reserve-price auction)) ERR_BID_TOO_LOW)
        )
        
        ;; Transfer bid to contract
        (try! (stx-transfer? bid-amount tx-sender (as-contract tx-sender)))
        
        ;; Refund previous bidder
        (try! (refund-previous-bidder auction-id current-bid))
        
        ;; Record new bid
        (map-set bids auction-id {
            bidder: tx-sender,
            amount: bid-amount,
            timestamp: block-height
        })
        
        (map-set user-bids { auction-id: auction-id, bidder: tx-sender } bid-amount)
        
        (print { event: "place-bid", auction-id: auction-id, bidder: tx-sender, amount: bid-amount })
        (ok true)
    )
)

(define-public (finalize-auction (nft-contract <nft-trait>) (auction-id uint))
    (let (
        (auction (unwrap! (map-get? auctions auction-id) ERR_NOT_FOUND))
        (winning-bid (map-get? bids auction-id))
    )
        (asserts! (>= block-height (get end-block auction)) ERR_AUCTION_ACTIVE)
        (asserts! (not (get finalized auction)) ERR_AUCTION_ENDED)
        
        (match winning-bid
            bid (begin
                ;; Calculate fee
                (let (
                    (fee (/ (* (get amount bid) (var-get platform-fee)) u10000))
                    (seller-amount (- (get amount bid) fee))
                )
                    ;; Transfer payment to seller
                    (try! (as-contract (stx-transfer? seller-amount tx-sender (get seller auction))))
                    (try! (as-contract (stx-transfer? fee tx-sender CONTRACT_OWNER)))
                    
                    ;; Transfer NFT to winner
                    (try! (as-contract (contract-call? nft-contract transfer 
                        (get token-id auction) 
                        tx-sender 
                        (get bidder bid))))
                )
            )
            ;; No bids - return NFT to seller
            (try! (as-contract (contract-call? nft-contract transfer 
                (get token-id auction) 
                tx-sender 
                (get seller auction))))
        )
        
        ;; Mark as finalized
        (map-set auctions auction-id (merge auction { finalized: true }))
        
        (print { event: "finalize-auction", auction-id: auction-id })
        (ok true)
    )
)

(define-public (cancel-auction (nft-contract <nft-trait>) (auction-id uint))
    (let ((auction (unwrap! (map-get? auctions auction-id) ERR_NOT_FOUND)))
        (asserts! (is-eq tx-sender (get seller auction)) ERR_UNAUTHORIZED)
        (asserts! (< block-height (get end-block auction)) ERR_AUCTION_ENDED)
        (asserts! (is-none (map-get? bids auction-id)) ERR_AUCTION_ACTIVE)
        
        ;; Return NFT to seller
        (try! (as-contract (contract-call? nft-contract transfer 
            (get token-id auction) 
            tx-sender 
            (get seller auction))))
        
        (map-set auctions auction-id (merge auction { finalized: true }))
        (print { event: "cancel-auction", auction-id: auction-id })
        (ok true)
    )
)
