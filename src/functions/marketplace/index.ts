import BN from "bn.js"
import { chainQuery, txPallets } from "../../constants"
import { getQuery } from "../blockchain"

export const getMarketplaceMintFee = async () => {
  const fee: any = await getQuery(txPallets.marketplace, chainQuery.marketplaceMintFee)
  return fee as BN
}
