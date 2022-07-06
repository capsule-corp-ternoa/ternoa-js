"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFundsForTxFees = exports.getTxFees = exports.getTxTreasuryFee = exports.getTxGasFee = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const blockchain_1 = require("../blockchain");
const constants_1 = require("../constants");
const nft_1 = require("../nft");
const marketplace_1 = require("../marketplace");
const capsule_1 = require("../capsule");
const balance_1 = require("../balance");
/**
 * @name getTxGasFee
 * @summary Get the gas fee estimation for a transaction.
 * @param txHex Transaction hex
 * @param address Public address of the sender
 * @returns Transaction fee estimation
 */
const getTxGasFee = async (txHex, address) => {
    const api = await (0, blockchain_1.getRawApi)();
    const tx = api.tx(txHex);
    const info = await tx.paymentInfo(address);
    return info.partialFee;
};
exports.getTxGasFee = getTxGasFee;
/**
 * @name getTxTreasuryFee
 * @summary Get the fee needed by Ternoa treasury for specific transaction services.
 * @description Some Ternoa's services required additional fees on top of chain gas fees, for example: minting a marketplace, minting an NFT or creating a capsule.
 * @param txHex Transaction hex
 * @returns Fee estimation
 */
const getTxTreasuryFee = async (txHex) => {
    const api = await (0, blockchain_1.getRawApi)();
    const tx = api.tx(txHex);
    switch (`${tx.method.section}_${tx.method.method}`) {
        case `${constants_1.txPallets.nft}_${constants_1.txActions.create}`: {
            return await (0, nft_1.getNftMintFee)();
        }
        case `${constants_1.txPallets.marketplace}_${constants_1.txActions.create}`: {
            return await (0, marketplace_1.getMarketplaceMintFee)();
        }
        case `${constants_1.txPallets.capsules}_${constants_1.txActions.create}`: {
            const capsuleMintFee = await (0, capsule_1.getCapsuleMintFee)();
            const nftMintFee = await (0, nft_1.getNftMintFee)();
            return capsuleMintFee.add(nftMintFee);
        }
        case `${constants_1.txPallets.capsules}_${constants_1.txActions.createFromNft}`: {
            return await (0, capsule_1.getCapsuleMintFee)();
        }
        default: {
            return new bn_js_1.default(0);
        }
    }
};
exports.getTxTreasuryFee = getTxTreasuryFee;
/**
 * @name getTxFees
 * @summary Get the total fees for a transaction hex.
 * @param txHex Hex of the transaction
 * @param address Public address of the sender
 * @returns Total estimated fee which is the sum of the chain gas fee and the treasury fee
 */
const getTxFees = async (txHex, address) => {
    const extrinsicFee = await (0, exports.getTxGasFee)(txHex, address);
    const treasuryFee = await (0, exports.getTxTreasuryFee)(txHex);
    return extrinsicFee.add(treasuryFee);
};
exports.getTxFees = getTxFees;
/**
 * @name checkFundsForTxFees
 * @summary Check if a signed transaction sender has enough funds to pay transaction gas fees on transaction submit.
 * @param tx Signed transaction object
 */
const checkFundsForTxFees = async (tx) => {
    const freeBalance = await (0, balance_1.getFreeBalance)(tx.signer.toString());
    const fees = await (0, exports.getTxFees)(tx.toHex(), tx.signer.toString());
    if (freeBalance.cmp(fees) === -1)
        throw new Error("Insufficient funds for gas or treasury");
};
exports.checkFundsForTxFees = checkFundsForTxFees;
