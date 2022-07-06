import BN from "bn.js"
import { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { consts, isValidAddress, query, runTx } from "../blockchain"
import { chainConstants, chainQuery, txActions, txPallets } from "../constants"
import { getFreeBalance } from "../balance"
import { ICollectionData, INftData } from "./interfaces"

/**
 * @name getNftMintFee
 * @summary Fee to mint an NFT (extra fee on top of the tx fees).
 * @returns NFT mint fee.
 */
export const getNftMintFee = async () => {
  const fee: any = await query(txPallets.nft, chainQuery.nftMintFee)
  return fee as BN
}

/**
 * @name getCollectionSizeLimit
 * @summary Maximum collection length.
 * @returns Number.
 */
export const getCollectionSizeLimit = async () => {
  const sizeLimit: any = await consts(txPallets.nft, chainQuery.collectionSizeLimit)
  return sizeLimit as number
}

/**
 * @name getNextNftId
 * @summary Get the next NFT Id available.
 * @returns Number.
 */
export const getNextNftId = async () => {
  const id: any = await query(txPallets.nft, chainQuery.nextNFTId)
  return id as number
}

/**
 * @name getNextCollectionId
 * @summary Get the next collection Id available.
 * @returns Number.
 */
export const getNextCollectionId = async () => {
  const id: any = await query(txPallets.nft, chainQuery.nextCollectionId)
  return id as number
}

/**
 * @name getNftOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getNftOffchainDataLimit = async () => {
  const limit: any = await consts(txPallets.nft, chainConstants.nftOffchainDataLimit)
  return limit as number
}

/**
 * @name getCollectionOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getCollectionOffchainDataLimit = async () => {
  const limit: any = await consts(txPallets.nft, chainConstants.collectionOffchainDataLimit)
  return limit as number
}

/**
 * @name checkNftOffchainDataLimit
 * @summary Checks if the nftOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkNftOffchainDataLimit = async (offchainLength: number) => {
  const limit = await getNftOffchainDataLimit()
  if (offchainLength > limit) throw new Error("nftOffchainData are too long.")
}

/**
 * @name checkCollectionOffchainDataLimit
 * @summary Checks if the collectionOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkCollectionOffchainDataLimit = async (offchainLength: number) => {
  const limit = await getCollectionOffchainDataLimit()
  if (offchainLength > limit) throw new Error("collectionOffchainData are too long.")
}

/**
 * @name checkBalanceToMintNft
 * @summary Checks if an account as enough funds to support the NFT mint fee.
 * @param address Public address of the account to check balance to mint an NFT.
 */
export const checkBalanceToMintNft = async (address: string) => {
  const freeBalance = await getFreeBalance(address)
  const nftMintFee = await getNftMintFee()
  if (freeBalance.cmp(nftMintFee) === -1) throw new Error("Insufficient funds to mint an NFT")
}

/**
 * @name checkCollectionSizeLimit
 * @summary Checks if the collection limit is lower than maximum limit.
 * @param limit Collection limit.
 */
export const checkCollectionSizeLimit = async (limit: number) => {
  if (limit <= 0) throw new Error("Collection limit is too low.")
  const collectionLimit = await getCollectionSizeLimit()
  if (limit > collectionLimit) throw new Error("Collection limit is too high.")
}

/**
 * @name getNftData
 * @summary Provides the data related to one NFT.
 * @param nftId The NFT id.
 * @returns A JSON object with the NFT data. ex:{owner, creator, offchainData, (...)}
 */
export const getNftData = async (nftId: number): Promise<INftData> => {
  const data = await query(txPallets.nft, chainQuery.nfts, [nftId])
  if (!data.toJSON()) throw new Error(`No data retrieved for the nftId : ${nftId}`)
  return data.toJSON() as {
    owner: string
    creator: string
    offchainData: string
    collectionId: number | null
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
  if (!data.toJSON()) throw new Error(`No data retrieved for the collectionId : ${collectionId}`)
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
export const compareData = async <T>(data: T, attribute: string, value: T) => {
  if (value !== (null || undefined) && data === value)
    throw new Error(`The ${attribute.replace(/_/g, " ")} is already set to : ${value}`)
}

/**
 * @name formatRoyalty
 * @summary Checks that royalty is in range 0 to 100 and format to permill.
 * @param royalty Number in range from 0 to 100 with max 4 decimals.
 * @returns The royalty in permill format.
 */
export const formatRoyalty = async (royalty: number) => {
  if (royalty > 100) throw new Error("The royalty must be set between 0% and 100%")
  const royaltyFixed = parseFloat(royalty.toFixed(4)) * 10000
  return royaltyFixed
}

/**
 * @name createNft
 * @summary Create a new NFT on the blockchain with the provided details.
 * @param nftOffchainData Any offchain data to add to the NFT. (ex: an ipfs id, a text)
 * @param nftRoyalty Royalty can be set from 0% to 100%. Default: 0
 * @param nftCollectionId The collection id to which the NFT will belong. Default: null
 * @param nftIsSoulbound Boolean that lock transfert after creation. Default: false
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription. If not specified, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const createNft = async (
  nftOffchainData: string,
  nftRoyalty = 0,
  nftCollectionId: number | null = null,
  nftIsSoulbound = false,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  if (keyring) {
    await checkBalanceToMintNft(keyring.address)
  }
  await checkNftOffchainDataLimit(nftOffchainData.length)
  if (nftCollectionId) {
    const { owner, isClosed, limit, nfts } = await getCollectionData(nftCollectionId)
    if (isClosed) throw new Error("Collection is closed.")
    if (nfts.length == limit) throw new Error(`Collection limit already reached.`)
    if (keyring && keyring.address !== owner) throw new Error("You are not the collection owner.")
  }
  const formatedRoyalty = await formatRoyalty(nftRoyalty)
  const tx = await runTx(
    txPallets.nft,
    txActions.createNft,
    [nftOffchainData, formatedRoyalty, nftCollectionId, nftIsSoulbound],
    keyring,
    callback,
  )
  return tx
}

/**
 * @name burnNft
 * @summary Remove an NFT from the storage.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const burnNft = async (
  nftId: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, state } = await getNftData(nftId)
  if (keyring && keyring.address !== owner) throw new Error("You are not the NFT owner.")
  const { isDelegated } = state
  if (isDelegated) throw new Error("Cannot burn a delegated NFT")
  const tx = await runTx(txPallets.nft, txActions.burnNft, [nftId], keyring, callback)
  return tx
}

/**
 * @name delegateNft
 * @summary Delegate an NFT to a recipient (does not change ownership).
 * @param nftRecipient Address to which the NFT will be delegated. If not specified NFT will be undelegated.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const delegateNft = async (
  nftId: number,
  nftRecipient: string | null = null,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  if (nftRecipient && !isValidAddress(nftRecipient)) throw new Error("Invalid recipient address format")
  const { owner, state } = await getNftData(nftId)
  if (keyring && keyring.address !== owner) throw new Error("You are not the NFT owner.")
  const { isDelegated } = state
  if (isDelegated && nftRecipient) throw new Error("NFT already delegated.")
  const tx = await runTx(txPallets.nft, txActions.delegateNft, [nftId, nftRecipient], keyring, callback)
  return tx
}

/**
 * @name transferNft
 * @summary Transfer an NFT from an account to another one.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param nftRecipient Address that will received the ownership of the NFT.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const transferNft = async (
  nftId: number,
  nftRecipient: string,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  if (!isValidAddress(nftRecipient)) throw new Error("Invalid recipient address format")
  const { owner, state } = await getNftData(nftId)
  if (keyring && keyring.address !== owner) throw new Error("You are not the NFT owner.")
  const { isDelegated, isSoulbound } = state
  if (isDelegated) throw new Error("Cannot transfer a delegated NFT")
  if (isSoulbound) throw new Error("Cannot transfer a soulbond NFT")
  const tx = await runTx(txPallets.nft, txActions.transferNft, [nftId, nftRecipient], keyring, callback)
  return tx
}

/**
 * @name setRoyalty
 * @summary Set the royalty of an NFT.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param nftRoyaltyFee Number in range from 0 to 100 with max 4 decimals.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const setRoyalty = async (
  nftId: number,
  nftRoyaltyFee: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, creator, royalty } = await getNftData(nftId)
  if (creator !== owner) throw new Error("Only creator of the NFT can set the royalty.")
  if (keyring && keyring.address !== owner) throw new Error("You are not the NFT owner.")
  const formatedRoyalty = await formatRoyalty(nftRoyaltyFee)
  await compareData<number>(royalty, "royalty", formatedRoyalty)
  const tx = await runTx(txPallets.nft, txActions.setRoyalty, [nftId, formatedRoyalty], keyring, callback)
  return tx
}

/**
 * @name addNftToCollection
 * @summary Add an NFT to a collection.
 * @param nftId The NFT id.
 * @param nftCollectionId The collection id to which the NFT will belong.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const addNftToCollection = async (
  nftId: number,
  nftCollectionId: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, collectionId } = await getNftData(nftId)
  if (collectionId === nftCollectionId) throw new Error(`Nft ${nftId} is already in the collection ${nftCollectionId}.`)
  if (collectionId !== null) throw new Error(`Nft ${nftId} is already in the collection ${collectionId}.`)
  if (keyring && keyring.address !== owner) throw new Error("You are not the NFT owner.")

  const collectionData = await getCollectionData(nftCollectionId)
  if (keyring && keyring.address !== collectionData.owner) throw new Error("You are not the collection owner.")
  const collectionMaxLimit = await getCollectionSizeLimit()
  if (
    (collectionData.limit === null && collectionData.nfts.length === collectionMaxLimit) ||
    collectionData.nfts.length === collectionData.limit
  )
    throw new Error(`Cannot add Nft ${nftId} to collection ${nftCollectionId} : Collection limit already reached.`)
  if (collectionData.isClosed)
    throw new Error(`Cannot add Nft ${nftId} to collection ${nftCollectionId} : Collection closed.`)
  const tx = await runTx(txPallets.nft, txActions.addNftToCollection, [nftId, nftCollectionId], keyring, callback)
  return tx
}

/**
 * @name createCollection
 * @summary Create a new collection with the provided details.
 * @param collectionOffchainData Any offchain data to add to the collection.
 * @param collectionLimit Number max of NFTs in collection.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const createCollection = async (
  collectionOffchainData: string,
  collectionLimit: number | null = null,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await checkCollectionOffchainDataLimit(collectionOffchainData.length)
  if (collectionLimit) await checkCollectionSizeLimit(collectionLimit)
  const tx = await runTx(
    txPallets.nft,
    txActions.createCollection,
    [collectionOffchainData, collectionLimit],
    keyring,
    callback,
  )
  return tx
}

/**
 * @name burnCollection
 * @summary Remove a collection from the storage.
 * @param collectionId The collection id to burn.
 * @param keyring Keyring pair to sign the data. Must be the owner of the collection.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const burnCollection = async (
  collectionId: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, nfts } = await getCollectionData(collectionId)
  if (keyring && keyring.address !== owner) throw new Error("You are not the collection owner.")
  if (nfts && nfts.length > 0) throw new Error("Cannot burn collection : Collection is not empty.")
  const tx = await runTx(txPallets.nft, txActions.burnCollection, [collectionId], keyring, callback)
  return tx
}

/**
 * @name closeCollection
 * @summary Makes the collection closed.
 * @param collectionId The collection id to close.
 * @param keyring Keyring pair to sign the data. Must be the owner of the collection.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const closeCollection = async (
  collectionId: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, isClosed } = await getCollectionData(collectionId)
  if (isClosed) throw new Error(`Collection ${collectionId} already closed.`)
  if (keyring && keyring.address !== owner) throw new Error("You are not the collection owner.")
  const tx = await runTx(txPallets.nft, txActions.closeCollection, [collectionId], keyring, callback)
  return tx
}

/**
 * @name limitCollection
 * @summary Set the maximum number (limit) of nfts in the collection.
 * @param collectionId The collection id to close.
 * @param setCollectionLimit Number max of NFTs in collection.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const limitCollection = async (
  collectionId: number,
  setCollectionLimit: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, limit, isClosed } = await getCollectionData(collectionId)
  if (keyring && keyring.address !== owner) throw new Error("You are not the collection owner.")
  if (limit && limit >= 1) throw new Error("Collection limit already set.")
  if (isClosed) throw new Error("Collection closed.")
  await checkCollectionSizeLimit(setCollectionLimit)
  const tx = await runTx(
    txPallets.nft,
    txActions.limitCollection,
    [collectionId, setCollectionLimit],
    keyring,
    callback,
  )
  return tx
}

// /**
//  * @name setNftMintFee
//  * @summary Set the fee for minting an NFT.
//  * @param fee New fee to mint an NFT
//  * @param keyring Keyring pair to sign the data
//  * @param callback Callback function to enable subscription, if not given, no subscription will be made
//  * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
//  */
// export const setNftMintFee = async (
//   fee: number | BN,
//   keyring?: IKeyringPair,
//   callback?: (result: ISubmittableResult) => void,
// ) => {
//   //who can set fee ?? democracy & tech committee
//   const nftMintFee = await getNftMintFee()
//   const formatedFee = typeof fee === "number" ? await unFormatBalance(fee) : fee
//   await compareData(nftMintFee, "nftMintFee", formatedFee)
//   const tx = await runTx(txPallets.nft, txActions.setNftMintFee, [formatedFee], keyring, callback)
//   return tx
// }

export * from "./interfaces"
