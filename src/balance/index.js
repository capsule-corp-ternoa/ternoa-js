"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferKeepAlive = exports.transferAll = exports.transfer = exports.checkBalanceForTransfer = exports.getFreeBalance = exports.getBalances = void 0;
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
/**
 * @name transfer
 * @summary Transfer some liquid free balance to another account
 * @param to Public address of the account to transfer amount to
 * @param value Token amount to transfer
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction or the hex value of the signable tx
 */
const transfer = async (to, value, keyring, callback) => {
    const amount = typeof value === "number" ? await (0, blockchain_1.unFormatBalance)(value) : value;
    if (keyring)
        await (0, exports.checkBalanceForTransfer)(keyring.address, amount);
    const hash = await (0, blockchain_1.runTx)(constants_1.txPallets.balances, constants_1.txActions.transfer, [to, amount], keyring, callback);
    return hash;
};
exports.transfer = transfer;
/**
 * @name transferAll
 * @summary Transfer the entire transferable balance from the caller account
 * @param to Public address of the account to transfer amount to
 * @param keepAlive Ensure that the transfer does not kill the account, it retains the Existential Deposit
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction or the hex value of the signable tx
 */
const transferAll = async (to, keepAlive = true, keyring, callback) => {
    const hash = await (0, blockchain_1.runTx)(constants_1.txPallets.balances, constants_1.txActions.transferAll, [to, keepAlive], keyring, callback);
    return hash;
};
exports.transferAll = transferAll;
/**
 * @name transferKeepAlive
 * @summary Transfer some liquid free balance to another account with a check that the transfer will not kill the origin account
 * @param to Public address of the account to transfer amount to
 * @param value Token amount to transfer
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction or the hex value of the signable tx
 */
const transferKeepAlive = async (to, value, keyring, callback) => {
    const amount = typeof value === "number" ? await (0, blockchain_1.unFormatBalance)(value) : value;
    if (keyring)
        await (0, exports.checkBalanceForTransfer)(keyring.address, amount);
    const hash = await (0, blockchain_1.runTx)(constants_1.txPallets.balances, constants_1.txActions.transferKeepAlive, [to, amount], keyring, callback);
    return hash;
};
exports.transferKeepAlive = transferKeepAlive;
