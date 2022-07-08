import BN from "bn.js"
import { consts } from "../blockchain"
import { Balance, chainConstants, txPallets } from "../constants"

/**
 * @name getInitialMintFee
 * @summary Original mint fee.
 * @returns Original NFT mint fee.
 */
export const getInitialMintFee = async (): Promise<Balance> => {
  const fee = consts(txPallets.nft, chainConstants.initialMintFee)
  return fee as any as Balance
}

/**
 * @name getCollectionSizeLimit
 * @summary Maximum collection length.
 * @returns Number.
 */
export const getCollectionSizeLimit = async (): Promise<number> => {
  const limit = consts(txPallets.nft, chainConstants.collectionSizeLimit)
  return (limit as any as BN).toNumber()
}

/**
 * @name getNftOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getNftOffchainDataLimit = async (): Promise<number> => {
  const limit = consts(txPallets.nft, chainConstants.nftOffchainDataLimit)
  return (limit as any as BN).toNumber()
}

/**
 * @name getCollectionOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getCollectionOffchainDataLimit = async (): Promise<number> => {
  const limit = consts(txPallets.nft, chainConstants.collectionOffchainDataLimit)
  return (limit as any as BN).toNumber()
}
