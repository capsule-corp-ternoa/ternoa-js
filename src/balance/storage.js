"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBalanceForTransfer = exports.getFreeBalance = exports.getBalances = void 0;
const constants_1 = require("../constants");
const blockchain_1 = require("../blockchain");
/**
 * @name getBalances
 * @summary Get the balances of an account including free, reserved, miscFrozen and feeFrozen balances as well as the total.
 * @param address Public address of the account to get balances
 * @returns The balances of the account
 */
const getBalances = async (address) => {
    const balances = (await (0, blockchain_1.query)(constants_1.txPallets.system, constants_1.chainQuery.account, [address])).data;
    return balances;
};
exports.getBalances = getBalances;
/**
 * @name getFreeBalance
 * @summary Get the free balance of an account
 * @param address Public address of the account to get free balance for
 * @returns The free balance of the account
 */
const getFreeBalance = async (address) => {
    const balances = await (0, exports.getBalances)(address);
    return balances.free;
};
exports.getFreeBalance = getFreeBalance;
/**
 * @name checkBalanceForTransfer
 * @summary Check if an account as enough funds to ensure a transfer
 * @param address Public address of the account to check balance for transfer
 * @param value Token amount to transfer
 */
const checkBalanceForTransfer = async (address, value) => {
    if (value <= 0)
        throw new Error("Value needs to be greater than 0");
    const freeBalance = await (0, exports.getFreeBalance)(address);
    const amount = typeof value === "number" ? await (0, blockchain_1.unFormatBalance)(value) : value;
    if (freeBalance.cmp(amount) === -1)
        throw new Error("Insufficient funds to transfer");
};
exports.checkBalanceForTransfer = checkBalanceForTransfer;
