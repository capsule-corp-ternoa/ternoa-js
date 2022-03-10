import BN from "bn.js"
import { getQuery } from "../blockchain"
import { chainQuery, txPallets } from "../../constants"

export const getNftMintFee = async () => {
  const fee: any = await getQuery(txPallets.nfts, chainQuery.nftMintFee)
  return fee as BN
}
