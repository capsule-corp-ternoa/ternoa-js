import BN from "bn.js"
import { chainQuery, txPallets } from "../constants"
import { query } from "../blockchain"

/**
 * @name getMarketplaceMintFee
 * @summary Get the amount of caps needed to mint a marketplace.
 * @returns Marketplace mint fee
 */
export const getMarketplaceMintFee = async (): Promise<BN> => {
  const fee: any = await query(txPallets.marketplace, chainQuery.marketplaceMintFee)
  return fee as BN
}
