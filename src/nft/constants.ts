import { consts, BalanceType } from "../blockchain"
import { chainConstants, txPallets } from "../constants"

/**
 * @name getInitialMintFee
 * @summary Original mint fee.
 * @returns Original NFT mint fee.
 */
export const getInitialMintFee = async (): Promise<BalanceType> => {
  const fee = consts(txPallets.nft, chainConstants.initialMintFee)
  return fee as any as BalanceType
}

/**
 * @name getCollectionSizeLimit
 * @summary Maximum collection length.
 * @returns Number.
 */
export const getCollectionSizeLimit = async (): Promise<number> => {
  const limit = consts(txPallets.nft, chainConstants.collectionSizeLimit)
  return (limit as any as BalanceType).toNumber()
}

/**
 * @name getNftOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getNftOffchainDataLimit = async (): Promise<number> => {
  const limit = consts(txPallets.nft, chainConstants.nftOffchainDataLimit)
  return (limit as any as BalanceType).toNumber()
}

/**
 * @name getCollectionOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getCollectionOffchainDataLimit = async (): Promise<number> => {
  const limit = consts(txPallets.nft, chainConstants.collectionOffchainDataLimit)
  return (limit as any as BalanceType).toNumber()
}
