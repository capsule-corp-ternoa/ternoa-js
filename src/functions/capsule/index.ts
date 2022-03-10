import BN from "bn.js"
import { chainQuery, txPallets } from "../../constants"
import { getQuery } from "../blockchain"

export const getCapsuleMintFee = async () => {
  const fee: any = await getQuery(txPallets.capsules, chainQuery.capsuleMintFee)
  return fee as BN
}
