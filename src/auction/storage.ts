import BN from "bn.js"
import { bnToBn } from "@polkadot/util"
import { roundBalance } from "../helpers/utils"
import { query } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"
import { AuctionChainRawDataType, AuctionDataType, Bidder, ClaimableBidBalanceDataType } from "./types"

/**
 * @name getAuctionData
 * @summary       Provides the data related to an auction.
 * @param nftId   The ID of the auctionned NFT.
 * @returns       A JSON object with the auction data.
 */
export const getAuctionData = async (nftId: number): Promise<AuctionDataType | null> => {
  const data = await query(txPallets.auction, chainQuery.auctions, [nftId])
  if (data.isEmpty) {
    return null
  }
  try {
    const { creator, startBlock, endBlock, startPrice, buyItPrice, bidders, marketplaceId, isExtended } =
      data.toJSON() as any as AuctionChainRawDataType

    const startPriceAmount = bnToBn(startPrice).toString()
    const buyItPriceAmount = buyItPrice && bnToBn(buyItPrice).toString()
    const startPriceRounded = roundBalance(startPriceAmount)
    const buyItPriceRounded = buyItPriceAmount !== null ? roundBalance(buyItPriceAmount) : buyItPriceAmount
    const formattedBidders: Bidder[] = bidders.list.map((bidder) => {
      const [address, bid] = bidder
      const amount = bnToBn(bid).toString()
      const amountRounded = roundBalance(amount)
      return {
        bidder: address,
        amount,
        amountRounded,
      }
    })

    const auction: AuctionDataType = {
      creator,
      startBlock,
      endBlock,
      startPrice: startPriceAmount,
      startPriceRounded,
      buyItPrice: buyItPriceAmount,
      buyItPriceRounded,
      bidders: formattedBidders,
      marketplaceId,
      isExtended,
    }

    return auction
  } catch (error) {
    throw new Error(`${Errors.AUCTION_NFT_CONVERSION_ERROR}`)
  }
}

/**
 * @name getAuctionDeadline
 * @summary       Provides the auction ending block.
 * @param nftId   The ID of the auctionned NFT.
 * @returns       Number.
 */
export const getAuctionDeadline = async (nftId: number): Promise<number | null> => {
  const data = await query(txPallets.auction, chainQuery.auctions, [nftId])
  if (data.isEmpty) {
    return null
  }

  const { endBlock } = data.toJSON() as any as AuctionChainRawDataType
  return endBlock
}

/**
 * @name getClaimableBidBalance
 * @summary         Bids balance claimable after an auction ends.
 * @param address   The bidder address.
 * @returns         Number.
 */
export const getClaimableBidBalance = async (address: string): Promise<ClaimableBidBalanceDataType> => {
  const data = await query(txPallets.auction, chainQuery.claims, [address])
  const parsedData = data.toJSON() as any as BN
  const claimable = bnToBn(parsedData).toString()
  const claimableRounded = roundBalance(claimable)

  return {
    claimable,
    claimableRounded,
  }
}
