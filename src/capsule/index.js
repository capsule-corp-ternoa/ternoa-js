"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCapsuleMintFee = void 0;
const constants_1 = require("../constants");
const blockchain_1 = require("../blockchain");
/**
 * @name getCapsuleMintFee
 * @summary Get the amount of caps needed to mint a capsule.
 * @returns Capsule mint fee
 */
const getCapsuleMintFee = async () => {
    const fee = await (0, blockchain_1.query)(constants_1.txPallets.capsules, constants_1.chainQuery.capsuleMintFee);
    return fee;
};
exports.getCapsuleMintFee = getCapsuleMintFee;
