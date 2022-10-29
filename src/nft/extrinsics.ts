import { IKeyringPair } from "@polkadot/types/types"

import { createTxHex, submitTxBlocking, TransactionHashType } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import {
  CollectionBurnedEvent,
  CollectionClosedEvent,
  CollectionCreatedEvent,
  CollectionLimitedEvent,
  NFTAddedToCollectionEvent,
  NFTBurnedEvent,
  NFTCreatedEvent,
  NFTDelegatedEvent,
  NFTRoyaltySetEvent,
  NFTTransferredEvent,
  SecretAddedToNFTEvent,
} from "../events"

import { formatPermill } from "../helpers/utils"
import { SecretNftData } from "./types"

// NFTs

/**
 * @name createNftTx
 * @summary             Creates an unsigned unsubmitted Create-NFT Transaction Hash.
 * @param offchainData  Off-chain related NFT metadata. Can be an IPFS Hash, an URL or plain text.
 * @param royalty       Percentage of all second sales that the creator will receive. It's a decimal number in range [0, 100]. Default is 0.
 * @param collectionId  The collection that this NFT will belong. Optional Parameter.
 * @param isSoulbound   If true makes the NFT untransferable. Default is false.
 * @returns             Unsigned unsubmitted Create-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createNftTx = async (
  offchainData: string,
  royalty = 0,
  collectionId: number | undefined = undefined,
  isSoulbound = false,
): Promise<TransactionHashType> => {
  const formatedRoyalty = formatPermill(royalty)
  return await createTxHex(txPallets.nft, txActions.createNft, [
    offchainData,
    formatedRoyalty,
    collectionId,
    isSoulbound,
  ])
}

/**
 * @name createNft
 * @summary             Creates an NFT on the chain.
 * @param offchainData  Off-chain related NFT metadata. Can be an IPFS Hash, an URL or plain text.
 * @param royalty       Percentage of all second sales that the creator will receive. It's a decimal number in range [0, 100]. Default is 0.
 * @param collectionId  The collection that this NFT will belong. Optional Parameter.
 * @param isSoulbound   If true makes the NFT untransferable. Default is false.
 * @param keyring       Account that will sign the transaction.
 * @param waitUntil     Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns             NFTCreatedEvent Blockchain event.
 */
export const createNft = async (
  offchainData: string,
  royalty = 0,
  collectionId: number | undefined = undefined,
  isSoulbound = false,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTCreatedEvent> => {
  const tx = await createNftTx(offchainData, royalty, collectionId, isSoulbound)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTCreatedEvent)
}

/**
 * @name createSecretNftTx
 * @summary                   Creates an unsigned unsubmitted Create-Secret-NFT Transaction Hash.
 * @param offchainData        Off-chain related NFT preview metadata. Can be an IPFS hash, a URL or plain text.
 * @param secretOffchainData  Off-chain related NFT secret metadata. Can be an IPFS hash, a URL or plain text.
 * @param royalty             Percentage of all second sales that the creator will receive. It's a decimal number in range [0, 100]. Default is 0.
 * @param collectionId        The collection to which the NFT belongs. Optional Parameter.
 * @param isSoulbound         If true, makes the NFT intransferable. Default is false.
 * @returns                   Unsigned unsubmitted Create-Secret-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createSecretNftTx = async (
  offchainData: string,
  secretOffchainData: string,
  royalty = 0,
  collectionId: number | undefined = undefined,
  isSoulbound = false,
): Promise<TransactionHashType> => {
  const formatedRoyalty = formatPermill(royalty)
  return await createTxHex(txPallets.nft, txActions.createSecretNft, [
    offchainData,
    secretOffchainData,
    formatedRoyalty,
    collectionId,
    isSoulbound,
  ])
}

/**
 * @name createSecretNft
 * @summary                   Creates an unsigned unsubmitted Create-Secret-NFT Transaction Hash.
 * @param offchainData        Off-chain related NFT preview metadata. Can be an IPFS hash, a URL or plain text.
 * @param secretOffchainData  Off-chain related NFT secret metadata. Can be an IPFS hash, a URL or plain text.
 * @param royalty             Percentage of all second sales that the creator will receive. It's a decimal number in range [0, 100]. Default is 0.
 * @param collectionId        The collection to which the NFT belongs. Optional Parameter.
 * @param isSoulbound         If true, makes the NFT intransferable. Default is false.
 * @param keyring             Account that will sign the transaction.
 * @param waitUntil           Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns                   Secret NFT data combining the data from NFTCreatedEvent and SecretAddedToNFTEvent.
 */
export const createSecretNft = async (
  offchainData: string,
  secretOffchainData: string,
  royalty = 0,
  collectionId: number | undefined = undefined,
  isSoulbound = false,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<SecretNftData> => {
  const tx = await createSecretNftTx(offchainData, secretOffchainData, royalty, collectionId, isSoulbound)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  const nftCreatedEvent = events.findEventOrThrow(NFTCreatedEvent)
  const secretAddedToNFTEvent = events.findEventOrThrow(SecretAddedToNFTEvent)
  return {
    nftId: nftCreatedEvent.nftId,
    owner: nftCreatedEvent.owner,
    creator: nftCreatedEvent.owner,
    offchainData: nftCreatedEvent.offchainData,
    secretOffchainData: secretAddedToNFTEvent.offchainData,
    royalty: nftCreatedEvent.royalty,
    collectionId: nftCreatedEvent.collectionId,
    isSoulbound: nftCreatedEvent.isSoulbound,
  }
}

/**
 * @name addSecretToNftTx
 * @summary                   Creates an unsigned unsubmitted Create-Secret-NFT Transaction Hash.
 * @param id                  The ID of the NFT.
 * @param secretOffchainData  Off-chain related NFT secret metadata. Can be an IPFS hash, a URL or plain text.
 * @returns                   Unsigned unsubmitted Create-Secret-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const addSecretToNftTx = async (id: string, secretOffchainData: string): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.addSecret, [id, secretOffchainData])
}

/**
 * @name addSecretToNft
 * @summary                   Creates an unsigned unsubmitted Create-Secret-NFT Transaction Hash.
 * @param id                  The ID of the NFT.
 * @param secretOffchainData  Off-chain related NFT secret metadata. Can be an IPFS hash, a URL or plain text.
 * @param keyring             Account that will sign the transaction.
 * @param waitUntil           Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns                   SecretAddedToNFTEvent Blockchain event.
 */
export const addSecretToNft = async (
  id: string,
  secretOffchainData: string,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<SecretAddedToNFTEvent> => {
  const tx = await addSecretToNftTx(id, secretOffchainData)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(SecretAddedToNFTEvent)
}

/**
 * @name burnNftTx
 * @summary   Creates an unsigned unsubmitted Burn-NFT Transaction Hash.
 * @param id  The ID of the NFT.
 * @returns   Unsigned unsubmitted Burn-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const burnNftTx = async (id: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.burnNft, [id])
}

/**
 * @name burnNft
 * @summary           Burns an NFT from the chain.
 * @param id          The ID of the NFT.
 * @param keyring     Account that will sign the transaction.
 * @param waitUntil   Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns           NFTBurnedEvent Blockchain event.
 */
export const burnNft = async (id: number, keyring: IKeyringPair, waitUntil: WaitUntil): Promise<NFTBurnedEvent> => {
  const tx = await burnNftTx(id)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTBurnedEvent)
}

/**
 * @name delegateNftTx
 * @summary           Creates an unsigned unsubmitted Delegate-NFT Transaction Hash.
 * @param id          The ID of the NFT.
 * @param recipient   Destination account. If set to undefined this functions acts as a way to undelegate a delegated NFT.
 * @returns           Unsigned unsubmitted Delegate-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const delegateNftTx = async (
  id: number,
  recipient: string | undefined = undefined,
): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.delegateNft, [id, recipient])
}

/**
 * @name delegateNft
 * @summary           Delegates an NFT to someone.
 * @param id          The ID of the NFT.
 * @param recipient   Destination account. If set to undefined this functions acts as a way to undelegate a delegated NFT.
 * @param keyring     Account that will sign the transaction.
 * @param waitUntil   Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns           NFTDelegatedEvent Blockchain event.
 */
export const delegateNft = async (
  id: number,
  recipient: string | undefined = undefined,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTDelegatedEvent> => {
  const tx = await delegateNftTx(id, recipient)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTDelegatedEvent)
}

/**
 * @name setRoyaltyTx
 * @summary       Creates an unsigned unsubmitted Set-Royalty Transaction Hash.
 * @param id      The ID of the NFT.
 * @param amount  The new royalty value.
 * @returns       Unsigned unsubmitted Set-Royalty-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setRoyaltyTx = async (id: number, amount: number): Promise<TransactionHashType> => {
  const formatedRoyalty = formatPermill(amount)
  return await createTxHex(txPallets.nft, txActions.setRoyalty, [id, formatedRoyalty])
}

/**
 * @name setRoyalty
 * @summary           Sets the royalty of an NFT.
 * @param id          The ID of the NFT.
 * @param amount      The new royalty value.
 * @param keyring     Account that will sign the transaction.
 * @param waitUntil   Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns           NFTRoyaltySetEvent Blockchain event.
 */
export const setRoyalty = async (
  id: number,
  amount: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTRoyaltySetEvent> => {
  const tx = await setRoyaltyTx(id, amount)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTRoyaltySetEvent)
}

/**
 * @name transferNftTx
 * @summary           Creates an unsigned unsubmitted Transfer-NFT Transaction Hash.
 * @param id          The ID of the NFT.
 * @param recipient   Destination account.
 * @returns           Unsigned unsubmitted Transfer-NFT Transaction Hash. The Hash is only valid for 5 minutes
 */
export const transferNftTx = async (id: number, recipient: string): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.transferNft, [id, recipient])
}

/**
 * @name transferNft
 * @summary           Sends an NFT to someone.
 * @param id          The ID of the NFT.
 * @param recipient   Destination account.
 * @param keyring     Account that will sign the transaction.
 * @param waitUntil   Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns           NFTTransferredEvent Blockchain event.
 */
export const transferNft = async (
  id: number,
  recipient: string,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTTransferredEvent> => {
  const tx = await transferNftTx(id, recipient)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTTransferredEvent)
}

/**
 * @name addNftToCollectionTx
 * @summary               Creates an unsigned unsubmitted Add-NFT-To-Collection Transaction Hash.
 * @param nftId          The ID of the NFT.
 * @param collectionId   The ID of the Collection.
 * @returns               Unsigned unsubmitted Add-NFT-To-Collection Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const addNftToCollectionTx = async (nftId: number, collectionId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.addNftToCollection, [nftId, collectionId])
}

/**
 * @name addNftToCollection
 * @summary               Adds an NFT to an existing collection.
 * @param nftId          The ID of the NFT.
 * @param collectionId   The ID of the Collection.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTAddedToCollectionEvent Blockchain event.
 */
export const addNftToCollection = async (
  nftId: number,
  collectionId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTAddedToCollectionEvent> => {
  const tx = await addNftToCollectionTx(nftId, collectionId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTAddedToCollectionEvent)
}

// Collections

/**
 * @name createCollectionTx
 * @summary               Creates an unsigned unsubmitted Create-Collection Transaction Hash.
 * @param offchainData    Off-chain related Collection metadata. Can be an IPFS Hash, an URL or plain text.
 * @param limit           The maximum amount that NFTs that the collection can hold. This is optional
 * @returns               Unsigned unsubmitted Create-Collection Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createCollectionTx = async (
  offchainData: string,
  limit: number | undefined = undefined,
): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.createCollection, [offchainData, limit])
}

/**
 * @name createCollection
 * @summary               Creates a collection.
 * @param offchainData    Off-chain related Collection metadata. Can be an IPFS Hash, an URL or plain text.
 * @param limit           Amount of NFTs that can be associated with this collection. This is optional
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               CollectionCreatedEvent Blockchain event.
 */
export const createCollection = async (
  offchainData: string,
  limit: number | undefined = undefined,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<CollectionCreatedEvent> => {
  const tx = await createCollectionTx(offchainData, limit)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(CollectionCreatedEvent)
}

/**
 * @name limitCollectionTx
 * @summary       Creates an unsigned unsubmitted Limit-Collection Transaction Hash.
 * @param id      The ID of the Collection.
 * @param limit   Amount of NFTs that can be associated with this collection.
 * @returns       Unsigned unsubmitted Limit-Collection Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const limitCollectionTx = async (id: number, limit: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.limitCollection, [id, limit])
}

/**
 * @name limitCollection
 * @summary           Limits how many NFTs can be associated with this collection.
 * @param id          The ID of the Collection.
 * @param limit       Amount of NFTs that can be associated with this collection.
 * @param keyring     Account that will sign the transaction.
 * @param waitUntil   Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns           CollectionLimitedEvent Blockchain event.
 */
export const limitCollection = async (
  id: number,
  limit: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<CollectionLimitedEvent> => {
  const tx = await limitCollectionTx(id, limit)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(CollectionLimitedEvent)
}

/**
 * @name closeCollectionTx
 * @summary   Creates an unsigned unsubmitted Close-Collection Transaction Hash.
 * @param id  The ID of the Collection.
 * @returns   Unsigned unsubmitted Close-Collection Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const closeCollectionTx = async (id: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.closeCollection, [id])
}

/**
 * @name closeCollection
 * @summary           Closes the collection so that no new NFTs can be added.
 * @param id          The ID of the Collection.
 * @param keyring     Account that will sign the transaction.
 * @param waitUntil   Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns           CollectionClosedEvent Blockchain event.
 */
export const closeCollection = async (
  id: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<CollectionClosedEvent> => {
  const tx = await closeCollectionTx(id)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(CollectionClosedEvent)
}

/**
 * @name burnCollectionTx
 * @summary   Creates an unsigned unsubmitted Burn-Collection Transaction Hash.
 * @param id  The ID of the Collection.
 * @returns   Unsigned unsubmitted Burn-Collection Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const burnCollectionTx = async (id: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.nft, txActions.burnCollection, [id])
}

/**
 * @name burnCollection
 * @summary           Burns an existing collection. The collections needs to be empty before it can be burned.
 * @param id          The ID of the Collection.
 * @param keyring     Account that will sign the transaction.
 * @param waitUntil   Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns           CollectionBurnedEvent Blockchain event.
 */
export const burnCollection = async (
  id: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<CollectionBurnedEvent> => {
  const tx = await burnCollectionTx(id)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(CollectionBurnedEvent)
}
