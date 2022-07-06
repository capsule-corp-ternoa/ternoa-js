import { IKeyringPair, } from "@polkadot/types/types"
import { CollectionBurnedEvent, CollectionClosedEvent, CollectionCreatedEvent, CollectionLimitedEvent, NFTAddedToCollectionEvent, NFTBurnedEvent, NFTCreatedEvent, NFTDelegatedEvent, NFTRoyaltySetEvent, NFTTransferredEvent } from "../events"
import { createTxHex, submitTxBlocking } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import { formatRoyalty } from "./storage"

// NFTs

/// TODO DOC!
export const createNftTx = async (
    offchainData: string,
    royalty: number = 0,
    collectionId: number | null = null,
    isSoulbound = false,
) => {
    const formatedRoyalty = await formatRoyalty(royalty);
    return await createTxHex(txPallets.nft, txActions.createNft, [offchainData, formatedRoyalty, collectionId, isSoulbound]);
}

/// TODO DOC!
export const createNft = async (
    offchainData: string,
    royalty: number = 0,
    collectionId: number | null = null,
    isSoulbound = false,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await createNftTx(offchainData, royalty, collectionId, isSoulbound);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTCreatedEvent);
}

/// TODO DOC!
export const burnNftTx = async (
    id: number,
) => {
    return await createTxHex(txPallets.nft, txActions.burnNft, [id]);
}


/// TODO DOC!
export const burnNft = async (
    id: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await burnNftTx(id);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTBurnedEvent);
}

/// TODO DOC!
export const delegateNftTx = async (
    id: number,
    recipient: string | null = null,
) => {
    return await createTxHex(txPallets.nft, txActions.delegateNft, [id, recipient]);
}

/// TODO DOC!
export const delegateNft = async (
    id: number,
    recipient: string | null = null,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await delegateNftTx(id, recipient);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTDelegatedEvent);
}

/// TODO DOC!
export const setRoyaltyTx = async (
    id: number,
    amount: number,
) => {
    const formatedRoyalty = await formatRoyalty(amount);
    return await createTxHex(txPallets.nft, txActions.setRoyalty, [id, formatedRoyalty]);
}

/// TODO DOC!
export const setRoyalty = async (
    id: number,
    amount: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await setRoyaltyTx(id, amount);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTRoyaltySetEvent);
}

/// TODO DOC!
export const transferNftTx = async (
    id: number,
    recipient: string,
) => {
    return await createTxHex(txPallets.nft, txActions.transferNft, [id, recipient]);
}

/// TODO DOC!
export const transferNft = async (
    id: number,
    number: string,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await transferNftTx(id, number);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTTransferredEvent);
}

/// TODO DOC!
export const addNftToCollectionTx = async (
    nft_id: number,
    collection_id: number,
) => {
    return await createTxHex(txPallets.nft, txActions.addNftToCollection, [nft_id, collection_id]);
}

/// TODO DOC!
export const addNftToCollection = async (
    nft_id: number,
    collection_id: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await addNftToCollectionTx(nft_id, collection_id);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTAddedToCollectionEvent);
}

// Collections

/// TODO DOC!
export const createCollectionTx = async (
    offchainData: string,
    limit: number | null = null,
) => {
    return await createTxHex(txPallets.nft, txActions.createCollection, [offchainData, limit]);
}

/// TODO DOC!
export const createCollection = async (
    offchainData: string,
    limit: number | null = null,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await createCollectionTx(offchainData, limit);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(CollectionCreatedEvent);
}

/// TODO DOC!
export const limitCollectionTx = async (
    id: number,
    limit: number,
) => {
    return await createTxHex(txPallets.nft, txActions.limitCollection, [id, limit]);
}

/// TODO DOC!
export const limitCollection = async (
    id: number,
    limit: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await limitCollectionTx(id, limit);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(CollectionLimitedEvent);
}

/// TODO DOC!
export const closeCollectionTx = async (
    id: number,
) => {
    return await createTxHex(txPallets.nft, txActions.closeCollection, [id]);
}

/// TODO DOC!
export const closeCollection = async (
    id: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await closeCollectionTx(id);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(CollectionClosedEvent);
}

/// TODO DOC!
export const burnCollectionTx = async (
    id: number,
) => {
    return await createTxHex(txPallets.nft, txActions.burnCollection, [id]);
}

/// TODO DOC!
export const burnCollection = async (
    id: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await burnCollectionTx(id);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(CollectionBurnedEvent);
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