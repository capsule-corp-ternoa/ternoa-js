import BN from "bn.js"
import { hexToString } from "@polkadot/util"
import { Balance, chainQuery, Errors, txPallets } from "../constants"
import { query } from "../blockchain"
import { IListedNft, IMarketplaceData } from "./interfaces"

/**
 * @name getMarketplaceMintFee
 * @summary               Fee to mint a Marketplace. (extra fee on top of the tx fees).
 * @returns               Marketplace mint fee.
 */
export const getMarketplaceMintFee = async (): Promise<Balance> => {
  const fee = await query(txPallets.marketplace, chainQuery.marketplaceMintFee)
  return fee as any as Balance
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
export const getMarketplaceData = async (marketplaceId: number): Promise<IMarketplaceData | null> => {
  const data = await query(txPallets.marketplace, chainQuery.marketplaces, [marketplaceId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toJSON() as IMarketplaceData
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
