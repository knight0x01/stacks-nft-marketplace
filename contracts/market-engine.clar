;; Market Engine V2 - Optimized NFT Marketplace System
;; Gas-optimized unified marketplace with listings, auctions, offers, and royalties

(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.sip-009-nft-trait.sip-009-nft-trait)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_EXPIRED (err u102))
(define-constant ERR_INVALID (err u103))
(define-constant ERR_ACTIVE (err u104))

(define-constant FEE u250) ;; 2.5%
(define-constant MIN u1000000) ;; 1 STX
(define-constant MIN_DURATION u144) ;; ~24h
(define-constant MAX_DURATION u4320) ;; ~30d
(define-constant MAX_ROYALTY u1000) ;; 10%

;; Data
(define-data-var listing-id uint u0)
(define-data-var auction-id uint u0)
(define-data-var offer-id uint u0)
(define-data-var treasury principal CONTRACT_OWNER)
(define-data-var paused bool false)

;; Maps
(define-map listings uint { nft: principal, token: uint, seller: principal, price: uint, expiry: uint, active: bool })
(define-map auctions uint { nft: principal, token: uint, seller: principal, reserve: uint, end: uint, done: bool })
(define-map bids uint { bidder: principal, amount: uint })
(define-map offers uint { nft: principal, token: uint, offerer: principal, amount: uint, expiry: uint, done: bool })
(define-map royalties { nft: principal, token: uint } { creator: principal, pct: uint })

;; Read-Only
(define-read-only (get-listing (id uint)) (ok (map-get? listings id)))
(define-read-only (get-auction (id uint)) (ok (map-get? auctions id)))
(define-read-only (get-offer (id uint)) (ok (map-get? offers id)))
(define-read-only (get-bid (id uint)) (ok (map-get? bids id)))
(define-read-only (get-royalty (nft principal) (token uint)) (ok (map-get? royalties { nft: nft, token: token })))

;; Private
(define-private (calc-fee (amt uint)) (/ (* amt FEE) u10000))

(define-private (pay (amt uint) (seller principal) (nft principal) (token uint))
  (let ((fee (calc-fee amt)))
    (match (map-get? royalties { nft: nft, token: token })
      r (let ((roy (/ (* amt (get pct r)) u10000)))
          (try! (stx-transfer? (- (- amt fee) roy) tx-sender seller))
          (try! (stx-transfer? roy tx-sender (get creator r)))
          (try! (stx-transfer? fee tx-sender (var-get treasury)))
          (ok true))
      (begin
        (try! (stx-transfer? (- amt fee) tx-sender seller))
        (try! (stx-transfer? fee tx-sender (var-get treasury)))
        (ok true)))))

;; Marketplace
(define-public (list (nft <nft-trait>) (token uint) (price uint) (expiry uint))
  (let ((id (+ (var-get listing-id) u1)))
    (asserts! (not (var-get paused)) ERR_UNAUTHORIZED)
    (asserts! (and (>= price MIN) (> expiry block-height)) ERR_INVALID)
    (try! (contract-call? nft transfer token tx-sender (as-contract tx-sender)))
    (map-set listings id { nft: (contract-of nft), token: token, seller: tx-sender, price: price, expiry: expiry, active: true })
    (var-set listing-id id)
    (print { e: "list", id: id, p: price })
    (ok id)))

(define-public (buy (nft <nft-trait>) (id uint))
  (let ((l (unwrap! (map-get? listings id) ERR_NOT_FOUND)))
    (asserts! (and (get active l) (<= block-height (get expiry l))) ERR_EXPIRED)
    (try! (pay (get price l) (get seller l) (get nft l) (get token l)))
    (try! (as-contract (contract-call? nft transfer (get token l) tx-sender tx-sender)))
    (map-set listings id (merge l { active: false }))
    (print { e: "buy", id: id })
    (ok true)))

(define-public (unlist (nft <nft-trait>) (id uint))
  (let ((l (unwrap! (map-get? listings id) ERR_NOT_FOUND)))
    (asserts! (and (is-eq tx-sender (get seller l)) (get active l)) ERR_UNAUTHORIZED)
    (try! (as-contract (contract-call? nft transfer (get token l) tx-sender (get seller l))))
    (map-set listings id (merge l { active: false }))
    (ok true)))

;; Auctions
(define-public (auction (nft <nft-trait>) (token uint) (reserve uint) (duration uint))
  (let ((id (+ (var-get auction-id) u1)))
    (asserts! (not (var-get paused)) ERR_UNAUTHORIZED)
    (asserts! (and (>= duration MIN_DURATION) (<= duration MAX_DURATION)) ERR_INVALID)
    (try! (contract-call? nft transfer token tx-sender (as-contract tx-sender)))
    (map-set auctions id { nft: (contract-of nft), token: token, seller: tx-sender, reserve: reserve, end: (+ block-height duration), done: false })
    (var-set auction-id id)
    (print { e: "auction", id: id })
    (ok id)))

(define-public (bid (id uint) (amt uint))
  (let ((a (unwrap! (map-get? auctions id) ERR_NOT_FOUND))
        (current-bid (map-get? bids id)))
    (asserts! (and (< block-height (get end a)) (not (get done a))) ERR_EXPIRED)
    (asserts! (>= amt (match current-bid b (+ (get amount b) MIN) (get reserve a))) ERR_INVALID)
    (try! (stx-transfer? amt tx-sender (as-contract tx-sender)))
    (match current-bid b (try! (as-contract (stx-transfer? (get amount b) tx-sender (get bidder b)))) true)
    (map-set bids id { bidder: tx-sender, amount: amt })
    (print { e: "bid", id: id, amt: amt })
    (ok true)))

(define-public (finalize (nft <nft-trait>) (id uint))
  (let ((a (unwrap! (map-get? auctions id) ERR_NOT_FOUND)))
    (asserts! (and (>= block-height (get end a)) (not (get done a))) ERR_ACTIVE)
    (match (map-get? bids id)
      b (begin
          (try! (pay (get amount b) (get seller a) (get nft a) (get token a)))
          (try! (as-contract (contract-call? nft transfer (get token a) tx-sender (get bidder b)))))
      (try! (as-contract (contract-call? nft transfer (get token a) tx-sender (get seller a)))))
    (map-set auctions id (merge a { done: true }))
    (ok true)))

;; Offers
(define-public (offer (nft principal) (token uint) (amt uint) (expiry uint))
  (let ((id (+ (var-get offer-id) u1)))
    (asserts! (and (>= amt MIN) (> expiry block-height)) ERR_INVALID)
    (try! (stx-transfer? amt tx-sender (as-contract tx-sender)))
    (map-set offers id { nft: nft, token: token, offerer: tx-sender, amount: amt, expiry: expiry, done: false })
    (var-set offer-id id)
    (print { e: "offer", id: id, amt: amt })
    (ok id)))

(define-public (accept (nft <nft-trait>) (id uint))
  (let ((o (unwrap! (map-get? offers id) ERR_NOT_FOUND)))
    (asserts! (and (not (get done o)) (<= block-height (get expiry o))) ERR_EXPIRED)
    (try! (pay (get amount o) tx-sender (get nft o) (get token o)))
    (try! (contract-call? nft transfer (get token o) tx-sender (get offerer o)))
    (map-set offers id (merge o { done: true }))
    (ok true)))

(define-public (cancel-offer (id uint))
  (let ((o (unwrap! (map-get? offers id) ERR_NOT_FOUND)))
    (asserts! (and (is-eq tx-sender (get offerer o)) (not (get done o))) ERR_UNAUTHORIZED)
    (try! (as-contract (stx-transfer? (get amount o) tx-sender (get offerer o))))
    (map-set offers id (merge o { done: true }))
    (ok true)))

;; Royalties
(define-public (set-royalty (nft principal) (token uint) (creator principal) (pct uint))
  (begin
    (asserts! (<= pct MAX_ROYALTY) ERR_INVALID)
    (map-set royalties { nft: nft, token: token } { creator: creator, pct: pct })
    (ok true)))

;; Admin
(define-public (set-treasury (new principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set treasury new)
    (ok true)))

(define-public (toggle)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (var-set paused (not (var-get paused)))
    (ok (var-get paused))))
