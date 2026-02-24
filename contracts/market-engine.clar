;; Market Engine - Complete NFT Marketplace System
;; Combines marketplace, auction, offers, and royalties in one engine

(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.sip-009-nft-trait.sip-009-nft-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_EXPIRED (err u102))
(define-constant ERR_INVALID_PRICE (err u103))
(define-constant ERR_AUCTION_ACTIVE (err u104))
(define-constant ERR_BID_TOO_LOW (err u105))

(define-constant PLATFORM_FEE u250) ;; 2.5%
(define-constant MIN_PRICE u1000000) ;; 1 STX

;; Data Variables
(define-data-var listing-nonce uint u0)
(define-data-var auction-nonce uint u0)
(define-data-var offer-nonce uint u0)
(define-data-var treasury principal CONTRACT_OWNER)
(define-data-var paused bool false)

;; Listings
(define-map listings
  uint
  {
    nft-contract: principal,
    token-id: uint,
    seller: principal,
    price: uint,
    expiry: uint
  }
)

(define-map active-listings uint bool)

;; Auctions
(define-map auctions
  uint
  {
    nft-contract: principal,
    token-id: uint,
    seller: principal,
    reserve: uint,
    end-block: uint,
    finalized: bool
  }
)

(define-map bids
  uint
  { bidder: principal, amount: uint }
)

;; Offers
(define-map offers
  uint
  {
    nft-contract: principal,
    token-id: uint,
    offerer: principal,
    amount: uint,
    expiry: uint,
    accepted: bool
  }
)

;; Royalties
(define-map royalties
  { nft-contract: principal, token-id: uint }
  { creator: principal, percentage: uint }
)

;; Read-Only Functions
(define-read-only (get-listing (id uint))
  (ok (map-get? listings id))
)

(define-read-only (get-auction (id uint))
  (ok (map-get? auctions id))
)

(define-read-only (get-offer (id uint))
  (ok (map-get? offers id))
)

(define-read-only (get-royalty (nft-contract principal) (token-id uint))
  (ok (map-get? royalties { nft-contract: nft-contract, token-id: token-id }))
)

;; Private Functions
(define-private (calculate-fee (price uint))
  (/ (* price PLATFORM_FEE) u10000)
)

(define-private (pay-with-royalty (price uint) (seller principal) (nft-contract principal) (token-id uint))
  (let (
    (fee (calculate-fee price))
    (royalty-info (map-get? royalties { nft-contract: nft-contract, token-id: token-id }))
  )
    (match royalty-info
      info (let (
        (royalty-amount (/ (* price (get percentage info)) u10000))
        (seller-amount (- (- price fee) royalty-amount))
      )
        (try! (stx-transfer? seller-amount tx-sender seller))
        (try! (stx-transfer? royalty-amount tx-sender (get creator info)))
        (try! (stx-transfer? fee tx-sender (var-get treasury)))
        (ok true)
      )
      (let ((seller-amount (- price fee)))
        (try! (stx-transfer? seller-amount tx-sender seller))
        (try! (stx-transfer? fee tx-sender (var-get treasury)))
        (ok true)
      )
    )
  )
)

;; Marketplace Functions
(define-public (list-nft (nft-contract <nft-trait>) (token-id uint) (price uint) (expiry uint))
  (let ((listing-id (+ (var-get listing-nonce) u1)))
    (asserts! (not (var-get paused)) ERR_UNAUTHORIZED)
    (asserts! (>= price MIN_PRICE) ERR_INVALID_PRICE)
    (asserts! (> expiry block-height) ERR_EXPIRED)
    
    (try! (contract-call? nft-contract transfer token-id tx-sender (as-contract tx-sender)))
    
    (map-set listings listing-id {
      nft-contract: (contract-of nft-contract),
      token-id: token-id,
      seller: tx-sender,
      price: price,
      expiry: expiry
    })
    
    (map-set active-listings listing-id true)
    (var-set listing-nonce listing-id)
    
    (print { event: "list-nft", listing-id: listing-id, price: price })
    (ok listing-id)
  )
)

(define-public (buy-nft (nft-contract <nft-trait>) (listing-id uint))
  (let ((listing (unwrap! (map-get? listings listing-id) ERR_NOT_FOUND)))
    (asserts! (default-to false (map-get? active-listings listing-id)) ERR_NOT_FOUND)
    (asserts! (<= block-height (get expiry listing)) ERR_EXPIRED)
    
    (try! (pay-with-royalty (get price listing) (get seller listing) (get nft-contract listing) (get token-id listing)))
    (try! (as-contract (contract-call? nft-contract transfer (get token-id listing) tx-sender tx-sender)))
    
    (map-delete active-listings listing-id)
    (print { event: "buy-nft", listing-id: listing-id, buyer: tx-sender })
    (ok true)
  )
)

(define-public (cancel-listing (nft-contract <nft-trait>) (listing-id uint))
  (let ((listing (unwrap! (map-get? listings listing-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get seller listing)) ERR_UNAUTHORIZED)
    (asserts! (default-to false (map-get? active-listings listing-id)) ERR_NOT_FOUND)
    
    (try! (as-contract (contract-call? nft-contract transfer (get token-id listing) tx-sender (get seller listing))))
    (map-delete active-listings listing-id)
    (ok true)
  )
)

;; Auction Functions
(define-public (create-auction (nft-contract <nft-trait>) (token-id uint) (reserve uint) (duration uint))
  (let ((auction-id (+ (var-get auction-nonce) u1)))
    (asserts! (not (var-get paused)) ERR_UNAUTHORIZED)
    (asserts! (and (>= duration u144) (<= duration u4320)) ERR_INVALID_PRICE)
    
    (try! (contract-call? nft-contract transfer token-id tx-sender (as-contract tx-sender)))
    
    (map-set auctions auction-id {
      nft-contract: (contract-of nft-contract),
      token-id: token-id,
      seller: tx-sender,
      reserve: reserve,
      end-block: (+ block-height duration),
      finalized: false
    })
    
    (var-set auction-nonce auction-id)
    (print { event: "create-auction", auction-id: auction-id })
    (ok auction-id)
  )
)

(define-public (place-bid (auction-id uint) (amount uint))
  (let (
    (auction (unwrap! (map-get? auctions auction-id) ERR_NOT_FOUND))
    (current-bid (map-get? bids auction-id))
  )
    (asserts! (< block-height (get end-block auction)) ERR_EXPIRED)
    (asserts! (not (get finalized auction)) ERR_AUCTION_ACTIVE)
    
    (match current-bid
      bid (asserts! (>= amount (+ (get amount bid) u1000000)) ERR_BID_TOO_LOW)
      (asserts! (>= amount (get reserve auction)) ERR_BID_TOO_LOW)
    )
    
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    (match current-bid
      bid (try! (as-contract (stx-transfer? (get amount bid) tx-sender (get bidder bid))))
      true
    )
    
    (map-set bids auction-id { bidder: tx-sender, amount: amount })
    (print { event: "place-bid", auction-id: auction-id, amount: amount })
    (ok true)
  )
)

(define-public (finalize-auction (nft-contract <nft-trait>) (auction-id uint))
  (let (
    (auction (unwrap! (map-get? auctions auction-id) ERR_NOT_FOUND))
    (winning-bid (map-get? bids auction-id))
  )
    (asserts! (>= block-height (get end-block auction)) ERR_AUCTION_ACTIVE)
    (asserts! (not (get finalized auction)) ERR_AUCTION_ACTIVE)
    
    (match winning-bid
      bid (begin
        (try! (pay-with-royalty (get amount bid) (get seller auction) (get nft-contract auction) (get token-id auction)))
        (try! (as-contract (contract-call? nft-contract transfer (get token-id auction) tx-sender (get bidder bid))))
      )
      (try! (as-contract (contract-call? nft-contract transfer (get token-id auction) tx-sender (get seller auction))))
    )
    
    (map-set auctions auction-id (merge auction { finalized: true }))
    (ok true)
  )
)

;; Offer Functions
(define-public (make-offer (nft-contract principal) (token-id uint) (amount uint) (expiry uint))
  (let ((offer-id (+ (var-get offer-nonce) u1)))
    (asserts! (>= amount MIN_PRICE) ERR_INVALID_PRICE)
    (asserts! (> expiry block-height) ERR_EXPIRED)
    
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    (map-set offers offer-id {
      nft-contract: nft-contract,
      token-id: token-id,
      offerer: tx-sender,
      amount: amount,
      expiry: expiry,
      accepted: false
    })
    
    (var-set offer-nonce offer-id)
    (print { event: "make-offer", offer-id: offer-id, amount: amount })
    (ok offer-id)
  )
)

(define-public (accept-offer (nft-contract <nft-trait>) (offer-id uint))
  (let ((offer (unwrap! (map-get? offers offer-id) ERR_NOT_FOUND)))
    (asserts! (not (get accepted offer)) ERR_UNAUTHORIZED)
    (asserts! (<= block-height (get expiry offer)) ERR_EXPIRED)
    
    (try! (pay-with-royalty (get amount offer) tx-sender (get nft-contract offer) (get token-id offer)))
    (try! (contract-call? nft-contract transfer (get token-id offer) tx-sender (get offerer offer)))
    
    (map-set offers offer-id (merge offer { accepted: true }))
    (ok true)
  )
)

;; Royalty Functions
(define-public (set-royalty (nft-contract principal) (token-id uint) (creator principal) (percentage uint))
  (begin
    (asserts! (<= percentage u1000) ERR_INVALID_PRICE)
    (map-set royalties { nft-contract: nft-contract, token-id: token-id } { creator: creator, percentage: percentage })
    (ok true)
  )
)

;; Admin Functions
(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set treasury new-treasury)
    (ok true)
  )
)

(define-public (toggle-pause)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set paused (not (var-get paused)))
    (ok (var-get paused))
  )
)
