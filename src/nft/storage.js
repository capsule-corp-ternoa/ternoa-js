"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRoyalty = exports.compareData = exports.getCollectionData = exports.getNftData = exports.checkCollectionSizeLimit = exports.checkBalanceToMintNft = exports.checkCollectionOffchainDataLimit = exports.checkNftOffchainDataLimit = exports.getCollectionOffchainDataLimit = exports.getNftOffchainDataLimit = exports.getNextCollectionId = exports.getNextNftId = exports.getCollectionSizeLimit = exports.getNftMintFee = void 0;
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
