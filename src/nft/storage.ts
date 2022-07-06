import BN from "bn.js"
import { consts, query } from "../blockchain"
import { chainConstants, chainQuery, Errors, txPallets } from "../constants"
import { getFreeBalance } from "../balance"
import { ICollectionData, INftData } from "./interfaces"

/**
 * @name getNftMintFee
 * @summary Fee to mint an NFT (extra fee on top of the tx fees).
 * @returns NFT mint fee.
 */
export const getNftMintFee = async (): Promise<BN> => {
  const fee: any = await query(txPallets.nft, chainQuery.nftMintFee)
  return fee as BN
}

/**
 * @name getCollectionSizeLimit
 * @summary Maximum collection length.
 * @returns Number.
 */
export const getCollectionSizeLimit = async (): Promise<number> => {
  const sizeLimit: any = await consts(txPallets.nft, chainQuery.collectionSizeLimit)
  return sizeLimit as number
}

/**
 * @name getNextNftId
 * @summary Get the next NFT Id available.
 * @returns Number.
 */
export const getNextNftId = async (): Promise<number> => {
  const id: any = await query(txPallets.nft, chainQuery.nextNFTId)
  return id as number
}

/**
 * @name getNextCollectionId
 * @summary Get the next collection Id available.
 * @returns Number.
 */
export const getNextCollectionId = async (): Promise<number> => {
  const id: any = await query(txPallets.nft, chainQuery.nextCollectionId)
  return id as number
}

/**
 * @name getNftOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getNftOffchainDataLimit = async (): Promise<number> => {
  const limit: any = await consts(txPallets.nft, chainConstants.nftOffchainDataLimit)
  return limit as number
}

/**
 * @name getCollectionOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getCollectionOffchainDataLimit = async (): Promise<number> => {
  const limit: any = await consts(txPallets.nft, chainConstants.collectionOffchainDataLimit)
  return limit as number
}

/**
 * @name checkNftOffchainDataLimit
 * @summary Checks if the nftOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkNftOffchainDataLimit = async (offchainLength: number): Promise<void> => {
  const limit = await getNftOffchainDataLimit()
  if (offchainLength > limit) throw new Error(Errors.OFFCHAIN_LENGTH_TOO_HIGH)
}

/**
 * @name checkCollectionOffchainDataLimit
 * @summary Checks if the collectionOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkCollectionOffchainDataLimit = async (offchainLength: number): Promise<void> => {
  const limit = await getCollectionOffchainDataLimit()
  if (offchainLength > limit) throw new Error(Errors.OFFCHAIN_LENGTH_TOO_HIGH)
}

/**
 * @name checkBalanceToMintNft
 * @summary Checks if an account as enough funds to support the NFT mint fee.
 * @param address Public address of the account to check balance to mint an NFT.
 */
export const checkBalanceToMintNft = async (address: string): Promise<void> => {
  const freeBalance = await getFreeBalance(address)
  const nftMintFee = await getNftMintFee()
  if (freeBalance.cmp(nftMintFee) === -1) throw new Error(Errors.INSUFFICIENT_FUNDS)
}

/**
 * @name checkCollectionSizeLimit
 * @summary Checks if the collection limit is lower than maximum limit.
 * @param limit Collection limit.
 */
export const checkCollectionSizeLimit = async (limit: number): Promise<void> => {
  if (limit <= 0) throw new Error(Errors.LIMIT_TOO_LOW)
  const collectionLimit = await getCollectionSizeLimit()
  if (limit > collectionLimit) throw new Error(Errors.LIMIT_TOO_HIGH)
}

/**
 * @name getNftData
 * @summary Provides the data related to one NFT.
 * @param nftId The NFT id.
 * @returns A JSON object with the NFT data. ex:{owner, creator, offchainData, (...)}
 */
export const getNftData = async (nftId: number): Promise<INftData> => {
  const data = await query(txPallets.nft, chainQuery.nfts, [nftId])
  if (!data.toJSON()) throw new Error(`${nftId}_${Errors.NFT_NOT_FOUND}`)
  return data.toJSON() as {
    owner: string
    creator: string
    offchainData: string
    collectionId: number | undefined
    royalty: number
    state: {
      isCapsule: boolean
      listedForSale: boolean
      isSecret: boolean
      isDelegated: boolean
      isSoulbound: boolean
    }
  }
}

/**
 * @name getCollectionData
 * @summary Provides the data related to one NFT collection. ex:{owner, creator, offchainData, limit, isClosed(...)}
 * @param collectionId The collection id.
 * @returns A JSON object with data of a single NFT collection.
 */
export const getCollectionData = async (collectionId: number): Promise<ICollectionData> => {
  const data = await query(txPallets.nft, chainQuery.collections, [collectionId])
  if (!data.toJSON()) throw new Error(`${collectionId}_${Errors.COLLECTION_NOT_FOUND}`)
  return data.toJSON() as {
    owner: string
    offchainData: string
    nfts: number[]
    limit: number
    isClosed: boolean
  }
}

/**
 * @name compareData
 * @summary Compares the current value of a extrinsic attribute to the new one to avoid running a transaction if they are equal.
 * @param data Current values to be compared.
 * @param attribute Attribute of the element to compare. (ex: nft.royalty, marketplace.commission_fee)
 * @param value New value to be compared to current data.
 */
export const compareData = async <T>(data: T, attribute: string, value: T): Promise<void> => {
  if (value !== (null || undefined) && data === value)
    throw new Error(`The ${attribute.replace(/_/g, " ")} is already set to : ${value}`)
}

/**
 * @name formatRoyalty
 * @summary Checks that royalty is in range 0 to 100 and format to permill.
 * @param royalty Number in range from 0 to 100 with max 4 decimals.
 * @returns The royalty in permill format.
 */
export const formatRoyalty = async (royalty: number): Promise<number> => {
  if (royalty > 100) throw new Error(Errors.ROYALTY_MUST_BE_PERCENTAGE)
  const royaltyFixed = parseFloat(royalty.toFixed(4)) * 10000
  return royaltyFixed
}
