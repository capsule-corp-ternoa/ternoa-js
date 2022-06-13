import BN from "bn.js"
import { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { consts, isValidAddress, query, runTx } from "../blockchain"
import { chainConstants, chainQuery, txActions, txPallets } from "../constants"
import { getFreeBalance } from "../balance"
import { ICollectionDatas, INftDatas } from "./interfaces"

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
 * @name getNftDatas
 * @summary Provides the NFT datas if an nftId is provided otherwise, get all NFTs datas.
 * @param nftId The NFT id.
 * @returns A JSON object with the NFT datas or all NFTs datas. ex:{owner, creator, offchainData, (...)}
 */
export const getNftDatas = async (nftId?: number): Promise<INftDatas> => {
  const datas = await query(txPallets.nft, chainQuery.nfTs, [nftId])
  if (!datas.toJSON()) throw new Error(`No data retrieved for the nftId : ${nftId}`)
  return datas.toJSON() as {
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
 * @name getCollectionDatas
 * @summary Provides the datas related to a specific collection if an collectionId is provided otherwise, get all collections datas. ex:{owner, creator, offchainData, limit, isClosed(...)}
 * @param collectionId The collection id.
 * @returns A JSON object with datas of a single or all collection(s).
 */
export const getCollectionDatas = async (collectionId?: number): Promise<ICollectionDatas> => {
  const datas = await query(txPallets.nft, chainQuery.collections, [collectionId])
  if (!datas.toJSON()) throw new Error(`No data retrieved for the collectionId : ${collectionId}`)
  return datas.toJSON() as {
    owner: string
    offchainData: string
    nfts: number[]
    limit: number
    isClosed: boolean
  }
}

/**
 * @name compareDatas
 * @summary Compares the current value of a extrinsic attribute to the new one to avoid running a transaction if they are equal.
 * @param datas Current values to be compared.
 * @param attribute Attribute of the element to compare. (ex: nft.royalty, marketplace.commission_fee)
 * @param value New value to be compared to current datas.
 */
export const compareDatas = async (datas: any, attribute: string, value: any) => {
  if (value != (null || undefined) && datas === value)
    throw new Error(`The ${attribute.replace(/_/g, " ")} is already set to : ${value}`)
}

/**
 * @name formatRoyalty
 * @summary Checks that royalty is in range 0 to 100 and format to permill.
 * @param royalty Number in range from 0 to 100 with max 4 decimals.
 * @returns The royalty in permill format.
 */
export const formatRoyalty = async (royalty: number) => {
  if (royalty > 100) throw new Error("The royalty must be set between 0.0000% and 100%")
  const royaltyFixed = parseFloat(royalty.toFixed(4)) * 10000
  return royaltyFixed
}

/**
 * @name createNft
 * @summary Create a new NFT on blockchain with the provided details.
 * @param creator Public address of the account to check balance to mint NFT.
 * @param offchainData Any offchain datas to add to the NFT. (ex: a link, ipfs datas, a text)
 * @param royalty Royalty can be set from 0% to 100%.
 * @param collectionId The collection id to which the NFT will belong.
 * @param isSoulbound Boolean that lock transfert after creation.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const createNft = async (
  creator: string,
  offchainData: string,
  royalty: number,
  collectionId?: number,
  isSoulbound = false,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await checkBalanceToMintNft(creator)
  await checkNftOffchainDataLimit(offchainData.length)
  collectionId && (await getCollectionDatas(collectionId))
  const formatedRoyalty = await formatRoyalty(royalty)
  const tx = await runTx(
    txPallets.nft,
    txActions.createNft,
    [offchainData, formatedRoyalty, collectionId, isSoulbound],
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
  keyring: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, state } = await getNftDatas(nftId)
  const { isDelegated } = state
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  if (isDelegated) throw new Error("Cannot burn a delegated NFT")
  const tx = await runTx(txPallets.nft, txActions.burnNft, [nftId], keyring, callback)
  return tx
}

/**
 * @name delegateNft
 * @summary Delegate an NFT to a recipient (does not change ownership).
 * @param nftId The id of the NFT that need to be delegated.
 * @param keyring Keyring pair to sign the data.
 * @param recipient Address to which the NFT will be delegated. If not specified NFT will be undelegated.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const delegateNft = async (
  nftId: number,
  keyring: IKeyringPair,
  recipient?: string,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner } = await getNftDatas(nftId)
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  if (recipient && !isValidAddress(recipient)) throw new Error("Invalid address format")
  const tx = await runTx(txPallets.nft, txActions.delegateNft, [nftId, recipient], keyring, callback)
  return tx
}

/**
 * @name transferNft
 * @summary Transfer an NFT from an account to another one.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param keyring Keyring pair to sign the data.
 * @param recipient Address that will received the use of the NFT.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const transferNft = async (
  nftId: number,
  keyring: IKeyringPair,
  recipient: string,
  callback?: (result: ISubmittableResult) => void,
) => {
  if (recipient && !isValidAddress(recipient)) throw new Error("Invalid address format")
  const { owner, state } = await getNftDatas(nftId)
  const { isDelegated, isSoulbound } = state
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  if (isDelegated) throw new Error("Cannot transfer a delegated Nft")
  if (isSoulbound) throw new Error("Cannot transfer a soulbond Nft")
  const tx = await runTx(txPallets.nft, txActions.transferNft, [nftId, recipient], keyring, callback)
  return tx
}

/**
 * @name setRoyalty
 * @summary Set the royalty of an NFT.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param keyring Keyring pair to sign the data.
 * @param royaltyFee Number in range from 0 to 100 with max 4 decimals.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const setRoyalty = async (
  nftId: number,
  keyring: IKeyringPair,
  royaltyFee: number,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, creator, royalty } = await getNftDatas(nftId)
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  if (creator !== keyring?.address) throw new Error("Only creator of the NFT can set the royalty.")
  const formatedRoyalty = await formatRoyalty(royaltyFee)
  await compareDatas(royalty, "royalty", formatedRoyalty)
  const tx = await runTx(txPallets.nft, txActions.setRoyalty, [nftId, formatedRoyalty], keyring, callback)
  return tx
}

/**
 * @name addNftToCollection
 * @summary Add an NFT to a collection.
 * @param nftId The NFT id.
 * @param keyring Keyring pair to sign the data.
 * @param collectionId The collection id to which the NFT will belong.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const addNftToCollection = async (
  nftId: number,
  keyring: IKeyringPair,
  collectionId: number,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner } = await getNftDatas(nftId)
  const collectionDatas = await getCollectionDatas(collectionId)
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  if (collectionDatas.owner !== keyring?.address) throw new Error("You are not the collection owner.")
  if (collectionDatas && collectionDatas.nfts.indexOf(nftId) > 0)
    throw new Error(`Nft ${nftId} is already in the collection ${collectionId}.`)
  if (collectionDatas && collectionDatas.nfts.length == collectionDatas.limit)
    throw new Error(`Cannot add Nft ${nftId} to collection ${collectionId} : Collection limit already reached.`)
  if (collectionDatas && collectionDatas.isClosed)
    throw new Error(`Cannot add Nft ${nftId} to collection ${collectionId} : Collection closed.`)
  const tx = await runTx(txPallets.nft, txActions.addNftToCollection, [nftId, collectionId], keyring, callback)
  return tx
}

/**
 * @name createCollection
 * @summary Create a new collection with the provided details.
 * @param offchainData Any offchain datas to add to the collection.
 * @param limit Number max of NFTs in collection.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const createCollection = async (
  offchainData: string,
  limit?: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await checkCollectionOffchainDataLimit(offchainData.length)
  limit && (await checkCollectionSizeLimit(limit))
  const tx = await runTx(txPallets.nft, txActions.createCollection, [offchainData, limit], keyring, callback)
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
  keyring: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, nfts } = await getCollectionDatas(collectionId)
  if (owner !== keyring?.address) throw new Error("You are not the collection owner.")
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
  keyring: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, isClosed } = await getCollectionDatas(collectionId)
  if (owner !== keyring?.address) throw new Error("You are not the collection owner.")
  if (isClosed) throw new Error(`Collection ${collectionId} already closed.`)
  const tx = await runTx(txPallets.nft, txActions.closeCollection, [collectionId], keyring, callback)
  return tx
}

/**
 * @name limitCollection
 * @summary Set the maximum number (limit) of nfts in the collection.
 * @param collectionId The collection id to close.
 * @param setLimit Number max of NFTs in collection.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
export const limitCollection = async (
  collectionId: number,
  setLimit: number,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, limit } = await getCollectionDatas(collectionId)
  if (owner !== keyring?.address) throw new Error("You are not the collection owner.")
  if (limit && limit > 0) throw new Error("Collection limit already set.") //is 0 considered as a set limit ??
  await checkCollectionSizeLimit(setLimit)
  const tx = await runTx(txPallets.nft, txActions.limitCollection, [collectionId, setLimit], keyring, callback)
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
//   await compareDatas(nftMintFee, "nftMintFee", formatedFee)
//   const tx = await runTx(txPallets.nft, txActions.setNftMintFee, [formatedFee], keyring, callback)
//   return tx
// }
