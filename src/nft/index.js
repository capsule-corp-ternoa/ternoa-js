"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTxNonBlocking = exports.submitTxBlocking = exports.createNft = exports.createCollection = exports.createNftTx = exports.createCollectionTx = exports.limitCollection = exports.closeCollection = exports.burnCollection = exports.addNftToCollection = exports.setRoyalty = exports.transferNft = exports.delegateNft = exports.burnNft = exports.formatRoyalty = exports.compareData = exports.getCollectionData = exports.getNftData = exports.checkCollectionSizeLimit = exports.checkBalanceToMintNft = exports.checkCollectionOffchainDataLimit = exports.checkNftOffchainDataLimit = exports.getCollectionOffchainDataLimit = exports.getNftOffchainDataLimit = exports.getNextCollectionId = exports.getNextNftId = exports.getCollectionSizeLimit = exports.getNftMintFee = void 0;
const blockchain_1 = require("../blockchain");
const constants_1 = require("../constants");
const balance_1 = require("../balance");
/**
 * @name getNftMintFee
 * @summary Fee to mint an NFT (extra fee on top of the tx fees).
 * @returns NFT mint fee.
 */
const getNftMintFee = async () => {
    const fee = await (0, blockchain_1.query)(constants_1.txPallets.nft, constants_1.chainQuery.nftMintFee);
    return fee;
};
exports.getNftMintFee = getNftMintFee;
/**
 * @name getCollectionSizeLimit
 * @summary Maximum collection length.
 * @returns Number.
 */
const getCollectionSizeLimit = async () => {
    const sizeLimit = await (0, blockchain_1.consts)(constants_1.txPallets.nft, constants_1.chainQuery.collectionSizeLimit);
    return sizeLimit;
};
exports.getCollectionSizeLimit = getCollectionSizeLimit;
/**
 * @name getNextNftId
 * @summary Get the next NFT Id available.
 * @returns Number.
 */
const getNextNftId = async () => {
    const id = await (0, blockchain_1.query)(constants_1.txPallets.nft, constants_1.chainQuery.nextNFTId);
    return id;
};
exports.getNextNftId = getNextNftId;
/**
 * @name getNextCollectionId
 * @summary Get the next collection Id available.
 * @returns Number.
 */
const getNextCollectionId = async () => {
    const id = await (0, blockchain_1.query)(constants_1.txPallets.nft, constants_1.chainQuery.nextCollectionId);
    return id;
};
exports.getNextCollectionId = getNextCollectionId;
/**
 * @name getNftOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
const getNftOffchainDataLimit = async () => {
    const limit = await (0, blockchain_1.consts)(constants_1.txPallets.nft, constants_1.chainConstants.nftOffchainDataLimit);
    return limit;
};
exports.getNftOffchainDataLimit = getNftOffchainDataLimit;
/**
 * @name getCollectionOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
const getCollectionOffchainDataLimit = async () => {
    const limit = await (0, blockchain_1.consts)(constants_1.txPallets.nft, constants_1.chainConstants.collectionOffchainDataLimit);
    return limit;
};
exports.getCollectionOffchainDataLimit = getCollectionOffchainDataLimit;
/**
 * @name checkNftOffchainDataLimit
 * @summary Checks if the nftOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
const checkNftOffchainDataLimit = async (offchainLength) => {
    const limit = await (0, exports.getNftOffchainDataLimit)();
    if (offchainLength > limit)
        throw new Error("nftOffchainData are too long.");
};
exports.checkNftOffchainDataLimit = checkNftOffchainDataLimit;
/**
 * @name checkCollectionOffchainDataLimit
 * @summary Checks if the collectionOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
const checkCollectionOffchainDataLimit = async (offchainLength) => {
    const limit = await (0, exports.getCollectionOffchainDataLimit)();
    if (offchainLength > limit)
        throw new Error("collectionOffchainData are too long.");
};
exports.checkCollectionOffchainDataLimit = checkCollectionOffchainDataLimit;
/**
 * @name checkBalanceToMintNft
 * @summary Checks if an account as enough funds to support the NFT mint fee.
 * @param address Public address of the account to check balance to mint an NFT.
 */
const checkBalanceToMintNft = async (address) => {
    const freeBalance = await (0, balance_1.getFreeBalance)(address);
    const nftMintFee = await (0, exports.getNftMintFee)();
    if (freeBalance.cmp(nftMintFee) === -1)
        throw new Error("Insufficient funds to mint an NFT");
};
exports.checkBalanceToMintNft = checkBalanceToMintNft;
/**
 * @name checkCollectionSizeLimit
 * @summary Checks if the collection limit is lower than maximum limit.
 * @param limit Collection limit.
 */
const checkCollectionSizeLimit = async (limit) => {
    if (limit <= 0)
        throw new Error("Collection limit is too low.");
    const collectionLimit = await (0, exports.getCollectionSizeLimit)();
    if (limit > collectionLimit)
        throw new Error("Collection limit is too high.");
};
exports.checkCollectionSizeLimit = checkCollectionSizeLimit;
/**
 * @name getNftData
 * @summary Provides the data related to one NFT.
 * @param nftId The NFT id.
 * @returns A JSON object with the NFT data. ex:{owner, creator, offchainData, (...)}
 */
const getNftData = async (nftId) => {
    const data = await (0, blockchain_1.query)(constants_1.txPallets.nft, constants_1.chainQuery.nfts, [nftId]);
    if (!data.toJSON())
        throw new Error(`No data retrieved for the nftId : ${nftId}`);
    return data.toJSON();
};
exports.getNftData = getNftData;
/**
 * @name getCollectionData
 * @summary Provides the data related to one NFT collection. ex:{owner, creator, offchainData, limit, isClosed(...)}
 * @param collectionId The collection id.
 * @returns A JSON object with data of a single NFT collection.
 */
const getCollectionData = async (collectionId) => {
    const data = await (0, blockchain_1.query)(constants_1.txPallets.nft, constants_1.chainQuery.collections, [collectionId]);
    if (!data.toJSON())
        throw new Error(`No data retrieved for the collectionId : ${collectionId}`);
    return data.toJSON();
};
exports.getCollectionData = getCollectionData;
/**
 * @name compareData
 * @summary Compares the current value of a extrinsic attribute to the new one to avoid running a transaction if they are equal.
 * @param data Current values to be compared.
 * @param attribute Attribute of the element to compare. (ex: nft.royalty, marketplace.commission_fee)
 * @param value New value to be compared to current data.
 */
const compareData = async (data, attribute, value) => {
    if (value !== (null || undefined) && data === value)
        throw new Error(`The ${attribute.replace(/_/g, " ")} is already set to : ${value}`);
};
exports.compareData = compareData;
/**
 * @name formatRoyalty
 * @summary Checks that royalty is in range 0 to 100 and format to permill.
 * @param royalty Number in range from 0 to 100 with max 4 decimals.
 * @returns The royalty in permill format.
 */
const formatRoyalty = async (royalty) => {
    if (royalty > 100)
        throw new Error("The royalty must be set between 0% and 100%");
    const royaltyFixed = parseFloat(royalty.toFixed(4)) * 10000;
    return royaltyFixed;
};
exports.formatRoyalty = formatRoyalty;
/**
 * @name burnNft
 * @summary Remove an NFT from the storage.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const burnNft = async (nftId, keyring, callback) => {
    const { owner, state } = await (0, exports.getNftData)(nftId);
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the NFT owner.");
    const { isDelegated } = state;
    if (isDelegated)
        throw new Error("Cannot burn a delegated NFT");
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.burnNft, [nftId], keyring, callback);
    return tx;
};
exports.burnNft = burnNft;
/**
 * @name delegateNft
 * @summary Delegate an NFT to a recipient (does not change ownership).
 * @param nftRecipient Address to which the NFT will be delegated. If not specified NFT will be undelegated.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const delegateNft = async (nftId, nftRecipient = null, keyring, callback) => {
    if (nftRecipient && !(0, blockchain_1.isValidAddress)(nftRecipient))
        throw new Error("Invalid recipient address format");
    const { owner, state } = await (0, exports.getNftData)(nftId);
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the NFT owner.");
    const { isDelegated } = state;
    if (isDelegated && nftRecipient)
        throw new Error("NFT already delegated.");
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.delegateNft, [nftId, nftRecipient], keyring, callback);
    return tx;
};
exports.delegateNft = delegateNft;
/**
 * @name transferNft
 * @summary Transfer an NFT from an account to another one.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param nftRecipient Address that will received the ownership of the NFT.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const transferNft = async (nftId, nftRecipient, keyring, callback) => {
    if (!(0, blockchain_1.isValidAddress)(nftRecipient))
        throw new Error("Invalid recipient address format");
    const { owner, state } = await (0, exports.getNftData)(nftId);
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the NFT owner.");
    const { isDelegated, isSoulbound } = state;
    if (isDelegated)
        throw new Error("Cannot transfer a delegated NFT");
    if (isSoulbound)
        throw new Error("Cannot transfer a soulbond NFT");
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.transferNft, [nftId, nftRecipient], keyring, callback);
    return tx;
};
exports.transferNft = transferNft;
/**
 * @name setRoyalty
 * @summary Set the royalty of an NFT.
 * @param nftId The id of the NFT that need to be burned from the storage.
 * @param nftRoyaltyFee Number in range from 0 to 100 with max 4 decimals.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const setRoyalty = async (nftId, nftRoyaltyFee, keyring, callback) => {
    const { owner, creator, royalty } = await (0, exports.getNftData)(nftId);
    if (creator !== owner)
        throw new Error("Only creator of the NFT can set the royalty.");
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the NFT owner.");
    const formatedRoyalty = await (0, exports.formatRoyalty)(nftRoyaltyFee);
    await (0, exports.compareData)(royalty, "royalty", formatedRoyalty);
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.setRoyalty, [nftId, formatedRoyalty], keyring, callback);
    return tx;
};
exports.setRoyalty = setRoyalty;
/**
 * @name addNftToCollection
 * @summary Add an NFT to a collection.
 * @param nftId The NFT id.
 * @param nftCollectionId The collection id to which the NFT will belong.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const addNftToCollection = async (nftId, nftCollectionId, keyring, callback) => {
    const { owner, collectionId } = await (0, exports.getNftData)(nftId);
    if (collectionId === nftCollectionId)
        throw new Error(`Nft ${nftId} is already in the collection ${nftCollectionId}.`);
    if (collectionId !== null)
        throw new Error(`Nft ${nftId} is already in the collection ${collectionId}.`);
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the NFT owner.");
    const collectionData = await (0, exports.getCollectionData)(nftCollectionId);
    if (keyring && keyring.address !== collectionData.owner)
        throw new Error("You are not the collection owner.");
    const collectionMaxLimit = await (0, exports.getCollectionSizeLimit)();
    if ((collectionData.limit === null && collectionData.nfts.length === collectionMaxLimit) ||
        collectionData.nfts.length === collectionData.limit)
        throw new Error(`Cannot add Nft ${nftId} to collection ${nftCollectionId} : Collection limit already reached.`);
    if (collectionData.isClosed)
        throw new Error(`Cannot add Nft ${nftId} to collection ${nftCollectionId} : Collection closed.`);
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.addNftToCollection, [nftId, nftCollectionId], keyring, callback);
    return tx;
};
exports.addNftToCollection = addNftToCollection;
/**
 * @name burnCollection
 * @summary Remove a collection from the storage.
 * @param collectionId The collection id to burn.
 * @param keyring Keyring pair to sign the data. Must be the owner of the collection.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const burnCollection = async (collectionId, keyring, callback) => {
    const { owner, nfts } = await (0, exports.getCollectionData)(collectionId);
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the collection owner.");
    if (nfts && nfts.length > 0)
        throw new Error("Cannot burn collection : Collection is not empty.");
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.burnCollection, [collectionId], keyring, callback);
    return tx;
};
exports.burnCollection = burnCollection;
/**
 * @name closeCollection
 * @summary Makes the collection closed.
 * @param collectionId The collection id to close.
 * @param keyring Keyring pair to sign the data. Must be the owner of the collection.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const closeCollection = async (collectionId, keyring, callback) => {
    const { owner, isClosed } = await (0, exports.getCollectionData)(collectionId);
    if (isClosed)
        throw new Error(`Collection ${collectionId} already closed.`);
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the collection owner.");
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.closeCollection, [collectionId], keyring, callback);
    return tx;
};
exports.closeCollection = closeCollection;
/**
 * @name limitCollection
 * @summary Set the maximum number (limit) of nfts in the collection.
 * @param collectionId The collection id to close.
 * @param setCollectionLimit Number max of NFTs in collection.
 * @param keyring Keyring pair to sign the data.
 * @param callback Callback function to enable subscription, if not given, no subscription will be made.
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed.
 */
const limitCollection = async (collectionId, setCollectionLimit, keyring, callback) => {
    const { owner, limit, isClosed } = await (0, exports.getCollectionData)(collectionId);
    if (keyring && keyring.address !== owner)
        throw new Error("You are not the collection owner.");
    if (limit && limit >= 1)
        throw new Error("Collection limit already set.");
    if (isClosed)
        throw new Error("Collection closed.");
    await (0, exports.checkCollectionSizeLimit)(setCollectionLimit);
    const tx = await (0, blockchain_1.runTx)(constants_1.txPallets.nft, constants_1.txActions.limitCollection, [collectionId, setCollectionLimit], keyring, callback);
    return tx;
};
exports.limitCollection = limitCollection;
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
// Flexible Interfaces
const createCollectionTx = async (collectionOffchainData, collectionLimit = null) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.createCollection, [collectionOffchainData, collectionLimit]);
};
exports.createCollectionTx = createCollectionTx;
const createNftTx = async (nftOffchainData, nftRoyalty, nftCollectionId = null, nftIsSoulbound = false) => {
    const formatedRoyalty = await (0, exports.formatRoyalty)(nftRoyalty);
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.nft, constants_1.txActions.createNft, [nftOffchainData, formatedRoyalty, nftCollectionId, nftIsSoulbound]);
};
exports.createNftTx = createNftTx;
// Newbies Interfaces
const createCollection = async (collectionOffchainData, collectionLimit = null, keyring, waitUntil) => {
    const signableTx = await (0, exports.createCollectionTx)(collectionOffchainData, collectionLimit);
    const signedTx = await (0, blockchain_1.signTx)(keyring, signableTx);
    const events = await submitTxBlocking(signedTx, waitUntil);
    let event = events.find(event => event.type == constants_1.EventType.CreateCollection);
    if (event == undefined) {
        throw new Error("Nice Error");
    }
    return event;
};
exports.createCollection = createCollection;
const createNft = async (nftOffchainData, nftRoyalty, nftCollectionId = null, nftIsSoulbound = false, keyring, waitUntil) => {
    const signableTx = await (0, exports.createNftTx)(nftOffchainData, nftRoyalty, nftCollectionId, nftIsSoulbound);
    const signedTx = await (0, blockchain_1.signTx)(keyring, signableTx);
    const events = await submitTxBlocking(signedTx, waitUntil);
    let event = events.find(event => event.type == constants_1.EventType.CreateNFT);
    if (event == undefined) {
        throw new Error("Nice Error");
    }
    return event;
};
exports.createNft = createNft;
async function submitTxBlocking(signedTx, waitUntil) {
    let [conVar, events] = await submitTxNonBlocking(signedTx, waitUntil);
    await conVar.wait();
    return events;
}
exports.submitTxBlocking = submitTxBlocking;
async function submitTxNonBlocking(signedTx, waitUntil) {
    let conVar = new constants_1.ConVar(100);
    let events = [];
    let callback = (result) => {
        if ((result.status.isFinalized && waitUntil == constants_1.WaitUntil.BlockFinalization)
            || (result.status.isInBlock && waitUntil == constants_1.WaitUntil.BlockInclusion)) {
            if (result.dispatchInfo) {
                for (let element of result.events) {
                    let event = constants_1.BlockchainEvent.fromEvent(element.event);
                    if (event) {
                        events.push(event);
                    }
                }
            }
            conVar.notify();
        }
        if (result.dispatchError) {
            console.log(result.dispatchError);
            conVar.notify();
        }
    };
    await (0, blockchain_1.submitTx)(signedTx, callback);
    return [conVar, events];
}
exports.submitTxNonBlocking = submitTxNonBlocking;
__exportStar(require("./interfaces"), exports);
