import BN from "bn.js"
import { chainQuery, txPallets } from "../../constants"
import { query } from "../blockchain"

/**
 * Get the amount of caps needed to mint a marketplace
 * @returns the mint fee
 */
export const getMarketplaceMintFee = async () => {
  const fee: any = await query(txPallets.marketplace, chainQuery.marketplaceMintFee)
  return fee as BN
}
