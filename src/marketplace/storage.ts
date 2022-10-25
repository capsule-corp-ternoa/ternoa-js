import { bnToBn, hexToString } from "@polkadot/util"
import BN from "bn.js"

import { IListedNft, MarketplaceDataType } from "./types"

import { query, balanceToNumber } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"

/**
 * @name getMarketplaceMintFee
 * @summary               Fee to mint a Marketplace. (extra fee on top of the tx fees).
 * @returns               Marketplace mint fee.
 */
export const getMarketplaceMintFee = async (): Promise<BN> => {
  const fee = await query(txPallets.marketplace, chainQuery.marketplaceMintFee)
  return fee as any as BN
}

/**
 * @name getNextMarketplaceId
 * @summary               Get the next Marketplace Id available.
 * @returns               Number.
 */
export const getNextMarketplaceId = async (): Promise<number> => {
  const id = await query(txPallets.marketplace, chainQuery.nextMarketplaceId)
  return (id as any as BN).toNumber()
}

/**
 * @name getMarketplaceData
 * @summary               Provides the data related to a marketplace.
 * @param marketplaceId   The Markeplace id.
 * @returns               A JSON object with the marketplace data. ex:{owner, kind, accountList, (...)}
 */
export const getMarketplaceData = async (marketplaceId: number): Promise<MarketplaceDataType | null> => {
  const data = await query(txPallets.marketplace, chainQuery.marketplaces, [marketplaceId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toJSON() as MarketplaceDataType
    if (result.commissionFee) {
      result.commissionFee.flat
        ? (result.commissionFee.flat = balanceToNumber(bnToBn(result.commissionFee.flat)))
        : (result.commissionFee.percentage = result.commissionFee.percentage / 10000)
    }
    if (result.listingFee) {
      result.listingFee.flat
        ? (result.listingFee.flat = balanceToNumber(bnToBn(result.listingFee.flat)))
        : (result.listingFee.percentage = result.listingFee.percentage / 10000)
    }
    // The offchainData is an hexadecimal string, we convert it to a human readable string.
    if (result.offchainData) result.offchainData = hexToString(result.offchainData)
    return result
  } catch (error) {
    throw new Error(`${Errors.MARKETPLACE_CONVERSION_ERROR}`)
  }
}

/**
 * @name getNftForSale
 * @summary               Provides the data related to an NFT listed for sale.
 * @param nftId           The NFT id.
 * @returns               A JSON object with the NFT listing data.
 */
export const getNftForSale = async (nftId: number): Promise<IListedNft | null> => {
  const data = await query(txPallets.marketplace, chainQuery.listedNfts, [nftId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toJSON() as any as IListedNft
    return result
  } catch (error) {
    throw new Error(`${Errors.LISTED_NFT_CONVERSION_ERROR}`)
  }
}
