import BN from "bn.js"
import { chainQuery, txPallets } from "../constants"
import { query } from "../blockchain"

/**
 * Get the amount of caps needed to mint a capsule
 * @returns the mint fee
 */
export const getCapsuleMintFee = async () => {
  const fee: any = await query(txPallets.capsules, chainQuery.capsuleMintFee)
  return fee as BN
}
