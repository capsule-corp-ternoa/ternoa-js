"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.burnCollection = exports.burnCollectionTx = exports.closeCollection = exports.closeCollectionTx = exports.limitCollection = exports.limitCollectionTx = exports.createCollection = exports.createCollectionTx = exports.addNftToCollection = exports.addNftToCollectionTx = exports.transferNft = exports.transferNftTx = exports.setRoyalty = exports.setRoyaltyTx = exports.delegateNft = exports.delegateNftTx = exports.burnNft = exports.burnNftTx = exports.createNft = exports.createNftTx = void 0;
const events_1 = require("../events");
const blockchain_1 = require("../blockchain");
const constants_1 = require("../constants");
const storage_1 = require("./storage");
// NFTs
/// TODO DOC!
const createNftTx = async (offchainData, royalty = 0, collectionId = null, isSoulbound = false) => {
    const formatedRoyalty = await (0, storage_1.formatRoyalty)(royalty);
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.createNft, [offchainData, formatedRoyalty, collectionId, isSoulbound]);
};
exports.createNftTx = createNftTx;
/// TODO DOC!
const createNft = async (offchainData, royalty = 0, collectionId = null, isSoulbound = false, keyring, waitUntil) => {
    const tx = await (0, exports.createNftTx)(offchainData, royalty, collectionId, isSoulbound);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTCreatedEvent);
};
exports.createNft = createNft;
/// TODO DOC!
const burnNftTx = async (id) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.burnNft, [id]);
};
exports.burnNftTx = burnNftTx;
/// TODO DOC!
const burnNft = async (id, keyring, waitUntil) => {
    const tx = await (0, exports.burnNftTx)(id);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTBurnedEvent);
};
exports.burnNft = burnNft;
/// TODO DOC!
const delegateNftTx = async (id, recipient = null) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.delegateNft, [id, recipient]);
};
exports.delegateNftTx = delegateNftTx;
/// TODO DOC!
const delegateNft = async (id, recipient = null, keyring, waitUntil) => {
    const tx = await (0, exports.delegateNftTx)(id, recipient);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTDelegatedEvent);
};
exports.delegateNft = delegateNft;
/// TODO DOC!
const setRoyaltyTx = async (id, amount) => {
    const formatedRoyalty = await (0, storage_1.formatRoyalty)(amount);
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.setRoyalty, [id, formatedRoyalty]);
};
exports.setRoyaltyTx = setRoyaltyTx;
/// TODO DOC!
const setRoyalty = async (id, amount, keyring, waitUntil) => {
    const tx = await (0, exports.setRoyaltyTx)(id, amount);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTRoyaltySetEvent);
};
exports.setRoyalty = setRoyalty;
/// TODO DOC!
const transferNftTx = async (id, recipient) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.transferNft, [id, recipient]);
};
exports.transferNftTx = transferNftTx;
/// TODO DOC!
const transferNft = async (id, number, keyring, waitUntil) => {
    const tx = await (0, exports.transferNftTx)(id, number);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTTransferredEvent);
};
exports.transferNft = transferNft;
/// TODO DOC!
const addNftToCollectionTx = async (nft_id, collection_id) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.addNftToCollection, [nft_id, collection_id]);
};
exports.addNftToCollectionTx = addNftToCollectionTx;
/// TODO DOC!
const addNftToCollection = async (nft_id, collection_id, keyring, waitUntil) => {
    const tx = await (0, exports.addNftToCollectionTx)(nft_id, collection_id);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTAddedToCollectionEvent);
};
exports.addNftToCollection = addNftToCollection;
// Collections
/// TODO DOC!
const createCollectionTx = async (offchainData, limit = null) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.createCollection, [offchainData, limit]);
};
exports.createCollectionTx = createCollectionTx;
/// TODO DOC!
const createCollection = async (offchainData, limit = null, keyring, waitUntil) => {
    const tx = await (0, exports.createCollectionTx)(offchainData, limit);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.CollectionCreatedEvent);
};
exports.createCollection = createCollection;
/// TODO DOC!
const limitCollectionTx = async (id, limit) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.limitCollection, [id, limit]);
};
exports.limitCollectionTx = limitCollectionTx;
/// TODO DOC!
const limitCollection = async (id, limit, keyring, waitUntil) => {
    const tx = await (0, exports.limitCollectionTx)(id, limit);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.CollectionLimitedEvent);
};
exports.limitCollection = limitCollection;
/// TODO DOC!
const closeCollectionTx = async (id) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.closeCollection, [id]);
};
exports.closeCollectionTx = closeCollectionTx;
/// TODO DOC!
const closeCollection = async (id, keyring, waitUntil) => {
    const tx = await (0, exports.closeCollectionTx)(id);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.CollectionClosedEvent);
};
exports.closeCollection = closeCollection;
/// TODO DOC!
const burnCollectionTx = async (id) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.burnCollection, [id]);
};
exports.burnCollectionTx = burnCollectionTx;
/// TODO DOC!
const burnCollection = async (id, keyring, waitUntil) => {
    const tx = await (0, exports.burnCollectionTx)(id);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.CollectionBurnedEvent);
};
exports.burnCollection = burnCollection;
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
