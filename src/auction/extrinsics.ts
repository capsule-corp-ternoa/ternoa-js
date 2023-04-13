import { IKeyringPair } from "@polkadot/types/types"
import BN from "bn.js"

import { createTxHex, numberToBalance, submitTxBlocking, TransactionHashType } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import {
  AuctionCancelledEvent,
  AuctionCompletedEvent,
  AuctionCreatedEvent,
  BalanceClaimedEvent,
  BidAddedEvent,
  BidRemovedEvent,
} from "../events"

/**
 * @name createAuctionTx
 * @summary               Creates an auction for an NFT.
 * @param nftId           The ID of the NFT.
 * @param marketplaceId   The ID of the marketplace where the auction will take place.
 * @param startBlock      The ID of the block at which the auction starts.
 * @param endBlock        The ID of the block at which the auction ends.
 * @param startPrice      The price at which the auction starts.
 * @param buyItPrice      The price to directly buy the NFT before the auction starts. Optional Parameter.
 * @returns               Unsigned unsubmitted Create-Auction Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createAuctionTx = async (
  nftId: number,
  marketplaceId: number,
  startBlock: number,
  endBlock: number,
  startPrice: number | BN,
  buyItPrice: number | BN | undefined = undefined,
): Promise<TransactionHashType> => {
  const formattedStartPrice = typeof startPrice === "number" ? numberToBalance(startPrice) : startPrice
  const formattedBuyItPrice = typeof buyItPrice === "number" ? numberToBalance(buyItPrice) : buyItPrice
  return await createTxHex(txPallets.auction, txActions.createAuction, [
    nftId,
    marketplaceId,
    startBlock,
    endBlock,
    formattedStartPrice,
    formattedBuyItPrice,
  ])
}

/**
 * @name createAuction
 * @summary               Creates an auction for an NFT.
 * @param nftId           The ID of the NFT.
 * @param marketplaceId   The ID of the marketplace where the auction will take place.
 * @param startBlock      The ID of the block at which the auction starts.
 * @param endBlock        The ID of the block at which the auction ends.
 * @param startPrice      The price at which the auction starts.
 * @param buyItPrice      The price to directly buy the NFT before the auction starts. Optional Parameter.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               AuctionCreatedEvent Blockchain event.
 */
export const createAuction = async (
  nftId: number,
  marketplaceId: number,
  startBlock: number,
  endBlock: number,
  startPrice: number | BN,
  buyItPrice: number | BN | undefined = undefined,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<AuctionCreatedEvent> => {
  const tx = await createAuctionTx(nftId, marketplaceId, startBlock, endBlock, startPrice, buyItPrice)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(AuctionCreatedEvent)
}

/**
 * @name cancelAuctionTx
 * @summary       Cancels an auction for an NFT. This transaction can only be submitted if the auction has not started yet.
 * @param nftId   The ID of the NFT.
 * @returns       Unsigned unsubmitted Cancel-Auction Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const cancelAuctionTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.auction, txActions.cancelAuction, [nftId])
}

/**
 * @name cancelAuction
 * @summary               Cancels an auction for an NFT.
 * @param nftId           The ID of the NFT.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               AuctionCancelledEvent Blockchain event.
 */
export const cancelAuction = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<AuctionCancelledEvent> => {
  const tx = await cancelAuctionTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(AuctionCancelledEvent)
}

/**
 * @name endAuctionTx
 * @summary       Ends an auction for an NFT. This transaction can only be submitted if the auction has entered the ending period.
 * @param nftId   The ID of the NFT.
 * @returns       Unsigned unsubmitted End-Auction Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const endAuctionTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.auction, txActions.endAuction, [nftId])
}

/**
 * @name endAuction
 * @summary               Ends an auction for an NFT
 * @param nftId           The ID of the NFT.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               AuctionCompletedEvent Blockchain event.
 */
export const endAuction = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<AuctionCompletedEvent> => {
  const tx = await endAuctionTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(AuctionCompletedEvent)
}

/**
 * @name addBidTx
 * @summary       The bidder adds a new bid offer.
 * @param nftId   The ID of the NFT.
 * @param amount  The new bid added.
 * @returns       Unsigned unsubmitted Add-Bid Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const addBidTx = async (nftId: number, amount: number | BN): Promise<TransactionHashType> => {
  const formattedAmount = typeof amount === "number" ? numberToBalance(amount) : amount
  return await createTxHex(txPallets.auction, txActions.addBid, [nftId, formattedAmount])
}

/**
 * @name addBid
 * @summary               The bidder adds a new bid offer.
 * @param nftId           The ID of the NFT.
 * @param amount          The new bid added.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               BidAddedEvent Blockchain event.
 */
export const addBid = async (
  nftId: number,
  amount: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<BidAddedEvent> => {
  const tx = await addBidTx(nftId, amount)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(BidAddedEvent)
}

/**
 * @name removeBidTx
 * @summary       The bidder removes his bid offer.
 * @param nftId   The ID of the NFT.
 * @returns       Unsigned unsubmitted Remove-Bid Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const removeBidTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.auction, txActions.removeBid, [nftId])
}

/**
 * @name removeBid
 * @summary               The bidder removes his bid offer.
 * @param nftId           The ID of the NFT.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               BidRemovedEvent Blockchain event.
 */
export const removeBid = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<BidRemovedEvent> => {
  const tx = await removeBidTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(BidRemovedEvent)
}

/**
 * @name buyItNowTx
 * @summary               The NFT can be directly buy if a buyItPrice was defined and the auction has not started yet.
 * @param nftId           The ID of the NFT.
 * @param signedPrice     The signed buy price.
 * @returns               Unsigned unsubmitted Buy-It-Now Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const buyItNowTx = async (nftId: number, signedPrice: number | BN): Promise<TransactionHashType> => {
  const formattedSignedPrice = typeof signedPrice === "number" ? numberToBalance(signedPrice) : signedPrice
  return await createTxHex(txPallets.auction, txActions.buyItNow, [nftId, formattedSignedPrice])
}

/**
 * @name buyItNow
 * @summary               The NFT can be directly buy if a buyItPrice was defined and the auction has not started yet.
 * @param nftId           The ID of the NFT.
 * @param signedPrice     The signed buy price.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               AuctionCompletedEvent Blockchain event.
 */
export const buyItNow = async (
  nftId: number,
  signedPrice: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<AuctionCompletedEvent> => {
  const tx = await buyItNowTx(nftId, signedPrice)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(AuctionCompletedEvent)
}

/**
 * @name claimTx
 * @summary   Bidders that did not win the auction have to claim back their bids balance after an auction ends.
 * @returns   Unsigned unsubmitted Buy-It-Now Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const claimTx = async (): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.auction, txActions.claim)
}

/**
 * @name claim
 * @summary               Bidders that did not win the auction have to claim back their bids balance after an auction ends.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               BalanceClaimedEvent Blockchain event.
 */
export const claim = async (keyring: IKeyringPair, waitUntil: WaitUntil): Promise<BalanceClaimedEvent> => {
  const tx = await claimTx()
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(BalanceClaimedEvent)
}
