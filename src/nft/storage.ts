import BN from "bn.js"
import { query } from "../blockchain"
import { Balance, chainQuery, Errors, txPallets } from "../constants"
import { ICollectionData, INftData } from "./interfaces"

/**
 * @name nftMintFee
 * @summary Fee to mint an NFT (extra fee on top of the tx fees).
 * @returns NFT mint fee.
 */
export const getNftMintFee = async (): Promise<Balance> => {
  const fee = await query(txPallets.nft, chainQuery.nftMintFee)
  return fee as any as Balance
}

/**
 * @name getNextNftId
 * @summary Get the next NFT Id available.
 * @returns Number.
 */
export const getNextNftId = async (): Promise<number> => {
  const id = await query(txPallets.nft, chainQuery.nextNFTId)
  return (id as any as BN).toNumber()
}

/**
 * @name getNextCollectionId
 * @summary Get the next collection Id available.
 * @returns Number.
 */
export const getNextCollectionId = async (): Promise<number> => {
  const id = await query(txPallets.nft, chainQuery.nextCollectionId)
  return (id as any as BN).toNumber()
}

/**
 * @name getNftData
 * @summary Provides the data related to one NFT.
 * @param nftId The NFT id.
 * @returns A JSON object with the NFT data. ex:{owner, creator, offchainData, (...)}
 */
export const getNftData = async (nftId: number): Promise<INftData | null> => {
  const data = await query(txPallets.nft, chainQuery.nfts, [nftId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    return data.toJSON() as any as INftData
  } catch (error) {
    throw new Error(`${Errors.NFT_CONVERSION_ERROR}`)
  }
}

/**
 * @name getCollectionData
 * @summary Provides the data related to one NFT collection. ex:{owner, creator, offchainData, limit, isClosed(...)}
 * @param collectionId The collection id.
 * @returns A JSON object with data of a single NFT collection.
 */
export const getCollectionData = async (collectionId: number): Promise<ICollectionData | null> => {
  const data = await query(txPallets.nft, chainQuery.collections, [collectionId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    return data.toJSON() as any as ICollectionData
  } catch (error) {
    throw new Error(`${Errors.COLLECTION_CONVERSION_ERROR}`)
  }
}
