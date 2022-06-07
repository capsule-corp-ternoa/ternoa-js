import BN from "bn.js"
import { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { consts, isValidAddress, query, runTx, unFormatBalance } from "../blockchain"
import { chainConstants, chainQuery, txActions, txPallets } from "../constants"
import { getBalance } from "../balance"
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
 * @summary Checks if the nftOffchain data length is lower than maxium authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkNftOffchainDataLimit = async (offchainLength: number) => {
  const limit = await getNftOffchainDataLimit()
  if (offchainLength > limit * 4) throw new Error("nftOffchainData are too long.")
}

/**
 * @name checkCollectionOffchainDataLimit
 * @summary Checks if the collectionOffchain data length is lower than maxium authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkCollectionOffchainDataLimit = async (offchainLength: number) => {
  const limit = await getCollectionOffchainDataLimit()
  if (offchainLength > limit * 4) throw new Error("collectionOffchainData are too long.")
}

/**
 * @name checkBalanceToMintNft
 * @summary Checks if an account as enough funds to support the NFT mint fee.
 * @param address Public address of the account to check balance to mint an NFT
 */
export const checkBalanceToMintNft = async (address: string) => {
  const balance = await getBalance(address)
  const nftMintFee = await getNftMintFee()
  if (balance.cmp(nftMintFee) === -1) throw new Error("Insufficient funds to mint an NFT")
}

/**
 * @name getNftDatas
 * @summary Provides the NFT datas if an nftid is provided otherwise, get all NFTs datas.
 * @param nftId The NFT id
 * @returns A JSON object with the NFT datas or all NFTs datas. ex:{owner, creator, offchainData, (...)}
 */
export const getNftDatas = async (nftId?: number): Promise<INftDatas> => {
  const datas = await query(txPallets.nft, chainQuery.nfTs, [nftId])
  if (!datas) throw new Error(`No data retrieved for the nftId : ${nftId}`)
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
 * @summary Provides the datas related to a specific collection if an collection id is provided otherwise, get all collections datas. ex:{owner, creator, offchainData, limit, isClosed(...)}
 * @param collectionId The collection id
 * @returns A JSON object with datas of a single or all collection(s)
 */
export const getCollectionDatas = async (collectionId?: number): Promise<ICollectionDatas> => {
  const datas = await query(txPallets.nft, chainQuery.collections, [collectionId])
  if (!datas) throw new Error(`No data retrieved for the collectionId : ${collectionId}`)
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
 * @param datas Current values to be compared
 * @param attribute Attribute of the element to compare (ex: nft.royalty, marketplace.commission_fee)
 * @param value New value to be compared to current datas
 */
export const compareDatas = async (datas: any, attribute: string, value: any) => {
  if (value != (null || undefined) && datas === value)
    throw new Error(`The ${attribute.replace(/_/g, " ")} of the Nft is already set to : ${value}`)
}

/**
 * @name formatRoyalty
 * @summary Checks that royalty is in range 0 to 100 and format to permill.
 * @param royalty Number in range from 0 to 100 with max 4 decimals
 * @returns the royalty in permill format
 */
export const formatRoyalty = async (royalty: number) => {
  if (royalty > 100) throw new Error("The royalty must be set between 0.0000% and 100%")
  const royaltyFixed = parseFloat(royalty.toFixed(4)) * 10000
  return royaltyFixed
}

/**
 * @name createNft
 * @summary Create a new NFT on blockchain with the provided details.
 * @param creator Public address of the account to check balance to mint NFT
 * @param offchainData Any offchain datas to add to the NFT (ex: a link, ipfs datas, a text)
 * @param royalty Royalty can be set from 0% to 100%
 * @param collectionId The collection id to which the NFT will belong
 * @param isSoulbound Boolean that lock transfert after creation
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const createNft = async (
  creator: string,
  offchainData: string,
  royalty: number,
  collectionId?: number, // can undefined be accepted as chain is waiting <u32> ??
  isSoulbound = false,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await checkBalanceToMintNft(creator)
  await checkNftOffchainDataLimit(offchainData.length)
  //await checkoffchainData() => query consts NFT and *4 to get 200 but need to confirm with Ghali for 150 charcaters. 200 included or not. What about the file upload ???
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
 * @param nftId The id of the NFT that need to be burned from the storage
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const burnNft = async (
  nftId: number,
  keyring: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner } = await getNftDatas(nftId)
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  const tx = await runTx(txPallets.nft, txActions.burnNft, [nftId], keyring, callback)
  return tx
}

/**
 * @name delegateNft
 * @summary Delegate an NFT to a recipient (does not change ownership).
 * @param nftId The id of the NFT that need to be delegated
 * @param keyring Keyring pair to sign the data
 * @param recipient Address to which the NFT will be delegated. If not specified NFT will be undelegated
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
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
 * @param nftId The id of the NFT that need to be burned from the storage
 * @param keyring Keyring pair to sign the data
 * @param recipient Address that will received the use of the NFT
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const transferNft = async (
  nftId: number,
  keyring: IKeyringPair,
  recipient: string,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, state } = await getNftDatas(nftId)
  const { isDelegated, isSoulbound } = state
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  if (recipient && !isValidAddress(recipient)) throw new Error("Invalid address format")
  if (isDelegated) throw new Error("Cannot transfer a delegated Nft")
  if (isSoulbound) throw new Error("Cannot transfer a soulbond Nft")
  const tx = await runTx(txPallets.nft, txActions.transferNft, [nftId, recipient], keyring, callback)
  return tx
}

/**
 * @name setRoyalty
 * @summary Set the royalty of an NFT.
 * @param nftId The id of the NFT that need to be burned from the storage
 * @param keyring Keyring pair to sign the data
 * @param royaltyFee Number in range from 0 to 100 with max 4 decimals
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const setRoyalty = async (
  nftId: number,
  keyring: IKeyringPair,
  royaltyFee: number,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner, royalty } = await getNftDatas(nftId)
  if (owner !== keyring?.address) throw new Error("You are not the nft owner.")
  const formatedRoyalty = await formatRoyalty(royaltyFee)
  await compareDatas(royalty, "royalty", formatedRoyalty)
  const tx = await runTx(txPallets.nft, txActions.setRoyalty, [nftId, formatedRoyalty], keyring, callback)
  return tx
}

/**
 * @name setNftMintFee
 * @summary Set the fee for minting an NFT.
 * @param fee New fee to mint an NFT
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const setNftMintFee = async (
  fee: number | BN,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  //check with Blockchain team main address how to check "owner" ??// expect BN or number ? what about the initial MFT Mint Fee
  const nftMintFee = await getNftMintFee()
  const formatedFee = typeof fee === "number" ? await unFormatBalance(fee) : fee
  await compareDatas(nftMintFee, "nftMintFee", formatedFee)
  const tx = await runTx(txPallets.nft, txActions.setNftMintFee, [formatedFee], keyring, callback)
  return tx
}

/**
 * @name addNftToCollection
 * @summary Add an NFT to a collection.
 * @param nftId The NFT id
 * @param keyring Keyring pair to sign the data.
 * @param collectionId The collection id to which the NFT will belong
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
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
  if (collectionDatas && collectionDatas.nfts.length >= collectionDatas.limit)
    throw new Error(`Cannot add Nft ${nftId} to collection ${collectionId} : Collection limit already reached.`)
  if (collectionDatas && collectionDatas.isClosed)
    throw new Error(`Cannot add Nft ${nftId} to collection ${collectionId} : Collection closed.`)
  const tx = await runTx(txPallets.nft, txActions.addNftToCollection, [nftId, collectionId], keyring, callback)
  return tx
}

/**
 * @name createCollection
 * @summary Create a new collection with the provided details.
 * @param offchainData Any offchain datas to add to the collection
 * @param limit Number max of NFTs in collection
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const createCollection = async (
  offchainData: string,
  limit?: number, // u32 ?
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  // await special fee to create collection ??
  //await checkoffchainData() => same as create nft ??
  //check on collection size limit ??
  //format limit to U32 ?
  await checkCollectionOffchainDataLimit(offchainData.length)
  const tx = await runTx(txPallets.nft, txActions.createCollection, [offchainData, limit], keyring, callback)
  return tx
}

/**
 * @name burnCollection
 * @summary Remove a collection from the storage.
 * @param collectionId The collection id to burn
 * @param keyring Keyring pair to sign the data. Must be the owner of the collection
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const burnCollection = async (
  collectionId: number,
  keyring: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const { owner } = await getCollectionDatas(collectionId)
  if (owner !== keyring?.address) throw new Error("You are not the collection owner.")
  const tx = await runTx(txPallets.nft, txActions.burnCollection, [collectionId], keyring, callback)
  return tx
}

/**
 * @name closeCollection
 * @summary Makes the collection closed.
 * @param collectionId The collection id to close
 * @param keyring Keyring pair to sign the data. Must be the owner of the collection.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
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
