"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balancesTransferKeepAlive = exports.balancesTransferKeepAliveTx = exports.balancesTransferAll = exports.balancesTransferAllTx = exports.balancesTransfer = exports.balancesTransferTx = void 0;
const constants_1 = require("../constants");
const blockchain_1 = require("../blockchain");
const events_1 = require("../events");
/// TODO DOC!
const balancesTransferTx = async (to, value) => {
    const amount = typeof value === "number" ? await (0, blockchain_1.unFormatBalance)(value) : value;
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.balances, constants_1.txActions.transfer, [to, amount]);
};
exports.balancesTransferTx = balancesTransferTx;
/// TODO DOC!
const balancesTransfer = async (to, value, keyring, waitUntil) => {
    const tx = await (0, exports.balancesTransferTx)(to, value);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.BalancesTransferEvent);
};
exports.balancesTransfer = balancesTransfer;
/// TODO DOC!
const balancesTransferAllTx = async (to, keepAlive = true) => {
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.balances, constants_1.txActions.transferAll, [to, keepAlive]);
};
exports.balancesTransferAllTx = balancesTransferAllTx;
/// TODO DOC!
const balancesTransferAll = async (to, keepAlive = true, keyring, waitUntil) => {
    const tx = await (0, exports.balancesTransferAllTx)(to, keepAlive);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.BalancesTransferEvent);
};
exports.balancesTransferAll = balancesTransferAll;
const balancesTransferKeepAliveTx = async (to, value) => {
    const amount = typeof value === "number" ? await (0, blockchain_1.unFormatBalance)(value) : value;
    return await (0, blockchain_1.createTxHex)(constants_1.txPallets.balances, constants_1.txActions.transferKeepAlive, [to, amount]);
};
exports.balancesTransferKeepAliveTx = balancesTransferKeepAliveTx;
const balancesTransferKeepAlive = async (to, value, keyring, waitUntil) => {
    const tx = await (0, exports.balancesTransferKeepAliveTx)(to, value);
    const events = await (0, blockchain_1.submitTxBlocking)(tx, waitUntil, keyring);
    return events.findEventOrThrow(events_1.BalancesTransferEvent);
};
exports.balancesTransferKeepAlive = balancesTransferKeepAlive;
