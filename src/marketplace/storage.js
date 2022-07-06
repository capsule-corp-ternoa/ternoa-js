"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketplaceMintFee = void 0;
const constants_1 = require("../constants");
const blockchain_1 = require("../blockchain");
/**
 * @name getMarketplaceMintFee
 * @summary Get the amount of caps needed to mint a marketplace.
 * @returns Marketplace mint fee
 */
const getMarketplaceMintFee = async () => {
    const fee = await (0, blockchain_1.query)(constants_1.txPallets.marketplace, constants_1.chainQuery.marketplaceMintFee);
    return fee;
};
exports.getMarketplaceMintFee = getMarketplaceMintFee;
