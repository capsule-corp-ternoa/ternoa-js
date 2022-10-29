import { hexToString } from "@polkadot/util"
import BN from "bn.js"
import { u8aToHex } from "index"

import { query } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"
import { CollectionData, NftData } from "./types"

/**
 * @name nftMintFee
 * @summary Fee to mint an NFT (extra fee on top of the tx fees).
 * @returns NFT mint fee.
 */
export const getNftMintFee = async (): Promise<BN> => {
  const fee = await query(txPallets.nft, chainQuery.nftMintFee)
  return fee as any as BN
}

/**
 * @name getSecretNftMintFee
 * @summary Fee to mint a secret NFT (extra fee on top of the tx fees and basic nft).
 * @returns Secret NFT mint fee.
 */
export const getSecretNftMintFee = async (): Promise<BN> => {
  const fee = await query(txPallets.nft, chainQuery.secretNftMintFee)
  return fee as any as BN
}

/**
 * @name getSecretNftOffchainData
 * @summary Get the secret offchain data of a Secret NFT.
 * @returns Secret NFT secret offchain data.
 */
export const getSecretNftOffchainData = async (nftId: number | string) => {
  const secretOffchainData = await query(txPallets.nft, chainQuery.secretNftsOffchainData, [nftId])
  return secretOffchainData.toHuman()
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
 * @summary       Provides the data related to one NFT.
 * @param nftId   The NFT id.
 * @returns       A JSON object with the NFT data. ex:{owner, creator, offchainData, (...)}
 */
export const getNftData = async (nftId: number): Promise<NftData | null> => {
  const data = await query(txPallets.nft, chainQuery.nfts, [nftId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toJSON() as NftData
    // The offchainData is an hexadecimal string, we convert it to a human readable string.
    if (result.offchainData) result.offchainData = hexToString(result.offchainData)
    return result
  } catch (error) {
    throw new Error(`${Errors.NFT_CONVERSION_ERROR}`)
  }
}

/**
 * @name getCollectionData
 * @summary             Provides the data related to one NFT collection. ex:{owner, creator, offchainData, limit, isClosed(...)}
 * @param collectionId  The collection id.
 * @returns             A JSON object with data of a single NFT collection.
 */
export const getCollectionData = async (collectionId: number): Promise<CollectionData | null> => {
  const data = await query(txPallets.nft, chainQuery.collections, [collectionId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    return data.toJSON() as any as CollectionData
  } catch (error) {
    throw new Error(`${Errors.COLLECTION_CONVERSION_ERROR}`)
  }
}
