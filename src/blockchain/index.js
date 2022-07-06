"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTxNonBlocking = exports.submitTxBlocking = exports.unFormatBalance = exports.formatBalance = exports.isValidSignature = exports.isValidAddress = exports.batchAllTxHex = exports.batchAllTx = exports.batchTxHex = exports.batchTx = exports.submitTx = exports.signTx = exports.createTxHex = exports.checkTxAvailable = exports.isTransactionSuccess = exports.consts = exports.query = exports.safeDisconnect = exports.getApiEndpoint = exports.isApiConnected = exports.getRawApi = exports.changeEndpoint = void 0;
const util_crypto_1 = require("@polkadot/util-crypto");
const api_1 = require("@polkadot/api");
const keyring_1 = require("@polkadot/keyring");
const util_1 = require("@polkadot/util");
const bn_js_1 = __importDefault(require("bn.js"));
const constants_1 = require("../constants");
const fee_1 = require("../fee");
const events_1 = require("../events");
const misc_1 = require("../misc");
const DEFAULT_CHAIN_ENDPOINT = "wss://alphanet.ternoa.com";
let api;
let chainEndpoint = DEFAULT_CHAIN_ENDPOINT;
let endpointChanged = false;
/**
 * @name initializeApi
 * @summary Initialize substrate api with selected or default wss endpoint.
 * @description The default chainEndpoint is "wss://alphanet.ternoa.com"
 */
const initializeApi = async () => {
    await (0, util_crypto_1.cryptoWaitReady)();
    (0, exports.safeDisconnect)();
    const wsProvider = new api_1.WsProvider(chainEndpoint);
    api = await api_1.ApiPromise.create({
        provider: wsProvider,
    });
    endpointChanged = false;
};
/**
 * @name changeEndpoint
 * @summary Set the chainEndpoint to specified parameter.
 * @param chain Chain endpoint
 */
const changeEndpoint = (chain) => {
    chainEndpoint = chain;
    endpointChanged = true;
};
exports.changeEndpoint = changeEndpoint;
/**
 * @name getRawApi
 * @summary Get initialized substrate Api instance.
 * @returns Promise containing the actual Api instance, a wrapper around the RPC and interfaces of the chain.
 */
const getRawApi = async () => {
    if (!(0, exports.isApiConnected)() || endpointChanged)
        await initializeApi();
    return api;
};
exports.getRawApi = getRawApi;
/**
 * @name isApiConnected
 * @summary Check if the Api instance existed and if it is connected.
 * @returns Boolean, true if the underlying provider is connected, false otherwise
 */
const isApiConnected = () => {
    return Boolean(api && api.isConnected);
};
exports.isApiConnected = isApiConnected;
/**
 * @name getApiEndpoint
 * @summary Returns the wss api endpoint
 * @returns String, the api endpoint connected with.
 */
const getApiEndpoint = () => {
    return chainEndpoint;
};
exports.getApiEndpoint = getApiEndpoint;
/**
 * @name safeDisconnect
 * @summary Disconnect safely from the underlying provider, halting all network traffic
 */
const safeDisconnect = async () => {
    if ((0, exports.isApiConnected)())
        await api.disconnect();
};
exports.safeDisconnect = safeDisconnect;
/**
 * @name query
 * @summary Generic function to make a chain query.
 * @example
 * <BR>
 *
 * ```javascript
 * // you can query without any args
 * const data = await query('balances', 'totalIssuance');
 *
 * // or you can pass args parameters to the storage query
 * const data = await query('system', 'account', ['5GesFQSwhmuMKAHcDrfm21Z5xrq6kW93C1ch2Xosq1rXx2Eh']);
 *
 * ```
 * @param module The section required to make the chain query (eg. "system")
 * @param call The call depending on the section (eg. "account")
 * @param args Array of args for the call
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Result of the query storage call
 */
const query = async (module, call, args = [], callback) => {
    const api = await (0, exports.getRawApi)();
    if (!callback) {
        return await api.query[module][call](...args);
    }
    else {
        return await api.query[module][call](...args, async (result) => {
            await callback(result);
        });
    }
};
exports.query = query;
/**
 * @name consts
 * @summary Generic function to get a chain constant.
 * @example
 * <BR>
 *
 * ```javascript
 * console.log(api.consts.balances.existentialDeposit.toString())
 * ```
 *
 * @param section The section required to get the chain constant (eg. "balances")
 * @param constantName The constantName depending on the section (eg. "existentialDeposit")
 * @returns The constant value
 */
const consts = async (section, constantName) => {
    const api = await (0, exports.getRawApi)();
    return api.consts[section][constantName];
};
exports.consts = consts;
/**
 * @name isTransactionSuccess
 * @summary Check if a transaction result is successful.
 * @param result Generic result passed as a parameter in a transaction callback
 * @returns Object containing a boolean success field indicating if transaction is successful
 * and a indexInterrupted field to indicate where the transaction stopped in case of a batch
 */
const isTransactionSuccess = (result) => {
    if (!(result.status.isInBlock || result.status.isFinalized))
        throw new Error("Transaction is not finalized or in block");
    const isFailed = result.events.findIndex((item) => item.event.section === constants_1.txPallets.system && item.event.method === constants_1.txEvent.ExtrinsicFailed) !== -1;
    const indexInterrupted = result.events.findIndex((item) => item.event.section === constants_1.txPallets.utility && item.event.method === constants_1.txEvent.BatchInterrupted);
    const isInterrupted = indexInterrupted !== -1;
    return {
        success: !isFailed && !isInterrupted,
        indexInterrupted: isInterrupted ? indexInterrupted : undefined,
    };
};
exports.isTransactionSuccess = isTransactionSuccess;
/**
 * @name checkTxAvailable
 * @summary Check if the pallet module and the subsequent extrinsic method exist in the Api instance.
 * @param txPallet Pallet module of the transaction
 * @param txExtrinsic Subsequent extrinsic method of the transaction
 * @returns Boolean, true if the pallet module and the subsequent extrinsic method exist, throw an Error otherwise
 */
const checkTxAvailable = async (txPallet, txExtrinsic) => {
    const api = await (0, exports.getRawApi)();
    try {
        api.tx[txPallet][txExtrinsic];
        return true;
    }
    catch (err) {
        throw new Error(`${txPallet}_${txExtrinsic} not found, check the selected endpoint`);
    }
};
exports.checkTxAvailable = checkTxAvailable;
/**
 * @name createTx
 * @summary Create a transaction.
 * @param txPallet Pallet module of the transaction
 * @param txExtrinsic Subsequent extrinsic method of the transaction
 * @param txArgs Arguments of the transaction
 * @returns Transaction object unsigned
 */
const createTx = async (txPallet, txExtrinsic, txArgs = []) => {
    const api = await (0, exports.getRawApi)();
    await (0, exports.checkTxAvailable)(txPallet, txExtrinsic);
    return api.tx[txPallet][txExtrinsic](...txArgs);
};
/**
 * @name createTxHex
 * @summary Create a transaction in hex format.
 * @param txPallet Pallet module of the transaction
 * @param txExtrinsic Subsequent extrinsic method of the transaction
 * @param txArgs Arguments of the transaction
 * @returns Hex value of the transaction
 */
const createTxHex = async (txPallet, txExtrinsic, txArgs = []) => {
    const tx = await createTx(txPallet, txExtrinsic, txArgs);
    return tx.toHex();
};
exports.createTxHex = createTxHex;
/**
 * @name signTx
 * @summary Sign a transaction.
 * @param keyring Keyring pair to sign the data
 * @param txHex Tx hex of the unsigned transaction to be signed
 * @param nonce Nonce to be used in the transaction, default to next available
 * @param validity Number of blocks during which transaction can be submitted, default to immortal
 * @returns Hex value of the signed transaction
 */
const signTx = async (keyring, txHex, nonce = -1, validity = 0) => {
    const api = await (0, exports.getRawApi)();
    const txSigned = await api.tx(txHex).signAsync(keyring, { nonce, blockHash: api.genesisHash, era: validity });
    return txSigned.toHex();
};
exports.signTx = signTx;
/**
 * @name submitTx
 * @summary Send a signed transaction on the blockchain.
 * @param txHex Transaction hex of the signed transaction to be submitted
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction
 */
const submitTx = async (txHex, callback) => {
    const api = await (0, exports.getRawApi)();
    const tx = api.tx(txHex);
    await (0, fee_1.checkFundsForTxFees)(tx);
    if (callback === undefined) {
        await tx.send();
    }
    else {
        const unsub = await tx.send(async (result) => {
            try {
                await callback(result);
                if (result.status.isFinalized) {
                    unsub();
                }
            }
            catch (err) {
                unsub();
                throw err;
            }
        });
    }
    return tx.hash.toHex();
};
exports.submitTx = submitTx;
/**
 * @name batchTx
 * @summary Create a batch transaction of dispatch calls.
 * @param txHexes Transactions to execute in the batch call
 * @returns Submittable extrinsic unsigned
 */
const batchTx = async (txHexes) => {
    const api = await (0, exports.getRawApi)();
    const tx = createTx(constants_1.txPallets.utility, constants_1.txActions.batch, [txHexes.map((x) => api.tx(x))]);
    return tx;
};
exports.batchTx = batchTx;
/**
 * @name batchTxHex
 * @summary Create a batch transaction of dispatch calls in hex format.
 * @param txHexes Transactions to execute in the batch call
 * @returns Hex of the submittable extrinsic unsigned
 */
const batchTxHex = async (txHexes) => {
    const tx = await (0, exports.batchTx)(txHexes);
    return tx.toHex();
};
exports.batchTxHex = batchTxHex;
/**
 * @name batchAllTx
 * @summary Create a batchAll transaction of dispatch calls.
 * @param txHexes Transactions to execute in the batch call
 * @returns Submittable extrinsic unsigned
 */
const batchAllTx = async (txHexes) => {
    const api = await (0, exports.getRawApi)();
    const tx = createTx(constants_1.txPallets.utility, constants_1.txActions.batchAll, [txHexes.map((x) => api.tx(x))]);
    return tx;
};
exports.batchAllTx = batchAllTx;
/**
 * @name batchAllTxHex
 * @summary Create a batchAll transaction of dispatch calls in hex format.
 * @param txHexes Transactions to execute in the batch call
 * @returns Hex of the submittable extrinsic unsigned
 */
const batchAllTxHex = async (txHexes) => {
    const tx = await (0, exports.batchAllTx)(txHexes);
    return tx.toHex();
};
exports.batchAllTxHex = batchAllTxHex;
/**
 * @name isValidAddress
 * @summary Check if an address is a valid Ternoa address.
 * @param address
 * @returns Boolean, true if the address is valid, false otherwise
 */
const isValidAddress = (address) => {
    try {
        (0, keyring_1.encodeAddress)((0, util_1.isHex)(address) ? (0, util_1.hexToU8a)(address) : (0, keyring_1.decodeAddress)(address));
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.isValidAddress = isValidAddress;
/**
 * @name isValidSignature
 * @summary Check if a message has been signed by the passed address.
 * @param signedMessage Message to check.
 * @param signature
 * @param address Address to verify the signer.
 * @returns Boolean, true if the address signed the message, false otherwise
 */
const isValidSignature = (signedMessage, signature, address) => {
    const publicKey = (0, keyring_1.decodeAddress)(address);
    const hexPublicKey = (0, util_1.u8aToHex)(publicKey);
    return (0, util_crypto_1.signatureVerify)(signedMessage, signature, hexPublicKey).isValid;
};
exports.isValidSignature = isValidSignature;
/**
 * @name formatBalance
 * @summary Format balance from BN to number.
 * @param input BN input.
 * @param options Formatting options from IFormatBalanceOptions.
 * @returns Formatted balance with SI and unit notation.
 */
const formatBalance = (input, options) => {
    var _a;
    util_1.formatBalance.setDefaults({ decimals: 18, unit: (_a = options === null || options === void 0 ? void 0 : options.unit) !== null && _a !== void 0 ? _a : "CAPS" });
    return (0, util_1.formatBalance)(input, options);
};
exports.formatBalance = formatBalance;
/**
 * @name unFormatBalance
 * @summary Format balance from number to BN.
 * @param _input Number input
 * @returns BN output
 */
const unFormatBalance = async (_input) => {
    const input = String(_input);
    const api = await (0, exports.getRawApi)();
    const siPower = new bn_js_1.default(api.registry.chainDecimals[0]);
    const basePower = api.registry.chainDecimals[0];
    const siUnitPower = 0;
    const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);
    let result;
    if (isDecimalValue) {
        if (siUnitPower - isDecimalValue[2].length < -basePower) {
            result = new bn_js_1.default(-1);
        }
        const div = new bn_js_1.default(input.replace(/\.\d*$/, ""));
        const modString = input.replace(/^\d+\./, "").substring(0, api.registry.chainDecimals[0] + 1);
        const mod = new bn_js_1.default(modString);
        result = div.mul(util_1.BN_TEN.pow(siPower)).add(mod.mul(util_1.BN_TEN.pow(new bn_js_1.default(basePower + siUnitPower - modString.length))));
    }
    else {
        result = new bn_js_1.default(input.replace(/[^\d]/g, "")).mul(util_1.BN_TEN.pow(siPower));
    }
    return result;
};
exports.unFormatBalance = unFormatBalance;
/// TODO DOC!
async function submitTxBlocking(tx, waitUntil, keyring) {
    let [conVar, events] = await submitTxNonBlocking(tx, waitUntil, keyring);
    await conVar.wait();
    return events;
}
exports.submitTxBlocking = submitTxBlocking;
/// TODO DOC!
async function submitTxNonBlocking(tx, waitUntil, keyring) {
    let conVar = new misc_1.ConditionalVariable(500);
    let events = new events_1.BlockchainEvents([]);
    if (keyring) {
        tx = await (0, exports.signTx)(keyring, tx);
    }
    let callback = (result) => {
        if ((result.status.isFinalized && waitUntil == constants_1.WaitUntil.BlockFinalization)
            || (result.status.isInBlock && waitUntil == constants_1.WaitUntil.BlockInclusion)) {
            events.inner = result.events.map(eventRecord => events_1.BlockchainEvent.fromEvent(eventRecord.event));
            conVar.notify();
        }
    };
    await (0, exports.submitTx)(tx, callback);
    return [conVar, events];
}
exports.submitTxNonBlocking = submitTxNonBlocking;
__exportStar(require("./interfaces"), exports);
