"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMarketplaceMintFee = exports.setMarketplaceMintFeeTx = exports.buyNft = exports.buyNftTx = exports.unlistNft = exports.unlistNftTx = exports.listNft = exports.listNftTx = exports.setMarketplaceKind = exports.setMarketplaceKindTx = exports.setMarketplaceOwner = exports.setMarketplaceOwnerTx = exports.createMarketplace = exports.createMarketplaceTx = void 0;
const events_1 = require("../events");
const blockchain_1 = require("../blockchain");
const constants_1 = require("../constants");
// NFTs
/// TODO DOC!
const createMarketplaceTx = async (kind) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.marketplace, constants_1.txActions.createMarketplace, [kind]);
};
exports.createMarketplaceTx = createMarketplaceTx;
/// TODO DOC!
const createMarketplace = async (kind, keyring, waitUntil) => {
    const tx = await (0, exports.createMarketplaceTx)(kind);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.MarketplaceCreatedEvent);
};
exports.createMarketplace = createMarketplace;
/// TODO DOC!
const setMarketplaceOwnerTx = async (id, recipient) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.marketplace, constants_1.txActions.setMarketplaceOwner, [id, recipient]);
};
exports.setMarketplaceOwnerTx = setMarketplaceOwnerTx;
/// TODO DOC!
const setMarketplaceOwner = async (id, recipient, keyring, waitUntil) => {
    const tx = await (0, exports.setMarketplaceOwnerTx)(id, recipient);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.MarketplaceOwnerSetEvent);
};
exports.setMarketplaceOwner = setMarketplaceOwner;
/// TODO DOC!
const setMarketplaceKindTx = async (id, kind) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.marketplace, constants_1.txActions.setMarketplaceKind, [id, kind]);
};
exports.setMarketplaceKindTx = setMarketplaceKindTx;
/// TODO DOC!
const setMarketplaceKind = async (id, kind, keyring, waitUntil) => {
    const tx = await (0, exports.setMarketplaceKindTx)(id, kind);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.MarketplaceKindSetEvent);
};
exports.setMarketplaceKind = setMarketplaceKind;
/// TODO DOC!
const listNftTx = async (nft_id, marketplace_id, price) => {
    let formatted_price = typeof price === "number" ? await (0, blockchain_1.unFormatBalance)(price) : price;
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.marketplace, constants_1.txActions.listNft, [nft_id, marketplace_id, formatted_price]);
};
exports.listNftTx = listNftTx;
/// TODO DOC!
const listNft = async (nft_id, marketplace_id, price, keyring, waitUntil) => {
    const tx = await (0, exports.listNftTx)(nft_id, marketplace_id, price);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTListedEvent);
};
exports.listNft = listNft;
/// TODO DOC!
const unlistNftTx = async (nft_id) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.marketplace, constants_1.txActions.unlist, [nft_id]);
};
exports.unlistNftTx = unlistNftTx;
/// TODO DOC!
const unlistNft = async (nft_id, keyring, waitUntil) => {
    const tx = await (0, exports.unlistNftTx)(nft_id);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTUnlistedEvent);
};
exports.unlistNft = unlistNft;
/// TODO DOC!
const buyNftTx = async (nft_id) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.marketplace, constants_1.txActions.buyNft, [nft_id]);
};
exports.buyNftTx = buyNftTx;
/// TODO DOC!
const buyNft = async (nft_id, keyring, waitUntil) => {
    const tx = await (0, exports.buyNftTx)(nft_id);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.NFTSoldEvent);
};
exports.buyNft = buyNft;
/// TODO DOC!
const setMarketplaceMintFeeTx = async (fee) => {
    let formatted_price = typeof fee === "number" ? await (0, blockchain_1.unFormatBalance)(fee) : fee;
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.marketplace, constants_1.txActions.setMarketplaceMintFee, [fee]);
};
exports.setMarketplaceMintFeeTx = setMarketplaceMintFeeTx;
/// TODO DOC!
const setMarketplaceMintFee = async (fee, keyring, waitUntil) => {
    const tx = await (0, exports.setMarketplaceMintFeeTx)(fee);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.MarketplaceMintFeeSetEvent);
};
exports.setMarketplaceMintFee = setMarketplaceMintFee;
