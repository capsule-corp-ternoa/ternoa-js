import BN from "bn.js"
import { query } from "../blockchain"
import { chainQuery, txPallets } from "../constants"

/**
 * @name getNftMintFee
 * @summary Get the amount of caps needed to mint an NFT.
 * @returns NFT mint fee
 */
export const getNftMintFee = async () => {
  const fee: any = await query(txPallets.nfts, chainQuery.nftMintFee)
  return fee as BN
}
