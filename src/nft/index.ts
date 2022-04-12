import BN from "bn.js"
import { query } from "../blockchain"
import { chainQuery, txPallets } from "../constants"

/**
 * Get the amount of caps needed to mint a NFT
 * @returns the mint fee
 */
export const getNftMintFee = async () => {
  const fee: any = await query(txPallets.nfts, chainQuery.nftMintFee)
  return fee as BN
}
