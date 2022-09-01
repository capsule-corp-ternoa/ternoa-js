import { consts } from "../blockchain"
import { chainConstants, txPallets } from "../constants"

/**
 * @name getAuctionEndingPeriod
 * @summary Period (in blocks) before the end of the auction during which an auction can be extended if new bids are added.
 * @returns Number.
 */
export const getAuctionEndingPeriod = (): number => {
  const endingPeriod = consts(txPallets.auction, chainConstants.auctionEndingPeriod)
  return Number.parseInt(endingPeriod.toString())
}

/**
 * @name getAuctionGracePeriod
 * @summary Period (in blocks) to extend an auction by if a new bid is received during the ending period.
 * @returns Number.
 */
export const getAuctionGracePeriod = (): number => {
  const gracePeriod = consts(txPallets.auction, chainConstants.auctionGracePeriod)
  return Number.parseInt(gracePeriod.toString())
}

/**
 * @name getBidderListLengthLimit
 * @summary Total amount of accounts that can be in the bidder list for an auction.
 * @returns Number.
 */
export const getBidderListLengthLimit = (): number => {
  const limit = consts(txPallets.auction, chainConstants.bidderListLengthLimit)
  return Number.parseInt(limit.toString())
}

/**
 * @name getMaxAuctionDelay
 * @summary Maximum amount of blocks between the current one and the start block of an auction.
 * @returns Number.
 */
export const getMaxAuctionDelay = (): number => {
  const maxDelay = consts(txPallets.auction, chainConstants.maxAuctionDelay)
  return Number.parseInt(maxDelay.toString())
}

/**
 * @name getMinAuctionDuration
 * @summary Minimum amount of blocks permitted for an auction's length.
 * @returns Number.
 */
export const getMinAuctionDuration = (): number => {
  const minDuration = consts(txPallets.auction, chainConstants.minAuctionDuration)
  return Number.parseInt(minDuration.toString())
}

/**
 * @name getMaxAuctionDuration
 * @summary Maximum amount of blocks permitted for an auction's length.
 * @returns Number.
 */
export const getMaxAuctionDuration = (): number => {
  const maxDuration = consts(txPallets.auction, chainConstants.maxAuctionDuration)
  return Number.parseInt(maxDuration.toString())
}

/**
 * @name getParallelAuctionLimit
 * @summary Maximum amount of auctions that can be active at the same time.
 * @returns Number.
 */
export const getParallelAuctionLimit = (): number => {
  const limit = consts(txPallets.auction, chainConstants.parallelAuctionLimit)
  return Number.parseInt(limit.toString())
}
