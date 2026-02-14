;; ---------------------------------------------------------
;; NFT Auction Contract
;; ---------------------------------------------------------
;; This contract implements an English Auction mechanism for SIP-009 NFTs.
;; Sellers can create auctions with a starting price and duration.
;; Bidders can place increasing bids, with STX being locked in the contract.
;; ---------------------------------------------------------

;; ---------------------------------------------------------
;; Constants & Error Codes
;; ---------------------------------------------------------
(define-constant CONTRACT_OWNER tx-sender)

;; Error Codes
(define-constant ERR_OWNER_ONLY (err u200))
(define-constant ERR_NOT_FOUND (err u201))
(define-constant ERR_AUCTION_ACTIVE (err u202))
(define-constant ERR_AUCTION_ENDED (err u203))
(define-constant ERR_BID_TOO_LOW (err u204))
(define-constant ERR_UNAUTHORIZED (err u205))

;; ---------------------------------------------------------
;; Data Variables
;; ---------------------------------------------------------

;; Counter for generating unique auction IDs
(define-data-var auction-nonce uint u0)

;; Auction extension period when a bid is placed near the end
(define-data-var extension-duration uint u10) ;; Default 10 blocks extension

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Store all details for each auction
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

;; Keep track of all bids placed for each auction
(define-map bid-history
    { auction-id: uint, bid-index: uint }
    {
        bidder: principal,
        amount: uint,
        timestamp: uint
    }
)

;; Total number of bids per auction
(define-map bid-count
    { auction-id: uint }
    uint
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

;; Retrieve information for a specific auction
(define-read-only (get-auction (auction-id uint))
    (map-get? auctions { auction-id: auction-id })
)



;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; @desc Manually extend an auction's duration
;; @param auction-id: The ID of the auction
;; @param additional-blocks: Number of blocks to add to the deadline
(define-public (extend-auction (auction-id uint) (additional-blocks uint))
    (let
        (
            (auction (unwrap! (map-get? auctions { auction-id: auction-id }) ERR_NOT_FOUND))
        )
        ;; Only seller can manually extend
        (asserts! (is-eq tx-sender (get seller auction)) ERR_UNAUTHORIZED)
        ;; Auction must be active
        (asserts! (get active auction) ERR_AUCTION_ENDED)
        
        ;; Update end block
        (map-set auctions
            { auction-id: auction-id }
            (merge auction { end-block: (+ (get end-block auction) additional-blocks) })
        )
        
        ;; Event emission
        (print { event: "extend-auction", auction-id: auction-id, additional-blocks: additional-blocks })
        (ok true)
    )
)

;; @desc Create a new English auction for an NFT
;; @param nft-contract: SIP-009 contract
;; @param token-id: Token ID to auction
;; @param start-price: Minimum starting bid
;; @param duration: Auction length in blocks
(define-public (create-auction (nft-contract principal) (token-id uint) (start-price uint) (duration uint))
    (let
        (
            (new-id (+ (var-get auction-nonce) u1))
            (end-block (+ block-height duration))
        )
        ;; Store auction details
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
        
        ;; Increment counter
        (var-set auction-nonce new-id)
        
        ;; Event emission
        (print { event: "create-auction", auction-id: new-id, seller: tx-sender, start-price: start-price })
        
        (ok new-id)
    )
)

;; @desc Place a bid on an active auction
;; @param auction-id: The ID of the auction
;; @param bid-amount: The bid amount in micro-STX
(define-public (place-bid (auction-id uint) (bid-amount uint))
    (let
        (
            (auction (unwrap! (map-get? auctions { auction-id: auction-id }) ERR_NOT_FOUND))
        )
        ;; Check if auction is still active
        (asserts! (get active auction) ERR_AUCTION_ENDED)
        ;; Check if deadline has passed
        (asserts! (< block-height (get end-block auction)) ERR_AUCTION_ENDED)
        ;; Check if bid is high enough
        (asserts! (> bid-amount (get highest-bid auction)) ERR_BID_TOO_LOW)
        (asserts! (>= bid-amount (get start-price auction)) ERR_BID_TOO_LOW)
        
        ;; Return previous bid to the previous highest bidder
        (match (get highest-bidder auction)
            prev-bidder (try! (as-contract (stx-transfer? (get highest-bid auction) tx-sender prev-bidder)))
            true
        )
        
        ;; Lock new bid in the contract
        (try! (stx-transfer? bid-amount tx-sender (as-contract tx-sender)))
        
        ;; Update auction state
        (map-set auctions
            { auction-id: auction-id }
            (merge auction {
                highest-bid: bid-amount,
                highest-bidder: (some tx-sender)
            })
        )
        
        ;; Event emission
        (print { event: "place-bid", auction-id: auction-id, bidder: tx-sender, amount: bid-amount })
        
        (ok true)
    )
)

(define-public (finalize-auction (auction-id uint))
    (let
        (
            (auction (unwrap! (map-get? auctions { auction-id: auction-id }) ERR_NOT_FOUND))
        )
        (asserts! (get active auction) ERR_NOT_FOUND)
        (asserts! (>= block-height (get end-block auction)) ERR_AUCTION_ACTIVE)
        
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
