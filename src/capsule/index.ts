import BN from "bn.js"
import { chainQuery, txPallets } from "../constants"
import { query } from "../blockchain"

/**
 * @name getCapsuleMintFee
 * @summary Get the amount of caps needed to mint a capsule.
 * @returns Capsule mint fee
 */
export const getCapsuleMintFee = async (): Promise<BN> => {
  const fee: any = await query(txPallets.capsules, chainQuery.capsuleMintFee)
  return fee as BN
}
