"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyringFromSeed = exports.generateSeed = void 0;
const util_crypto_1 = require("@polkadot/util-crypto");
const keyring_1 = require("@polkadot/keyring");
/**
 * @name generateSeed
 * @summary Generate a new account
 * @returns An object with the seed and the public address
 */
const generateSeed = async () => {
    await (0, util_crypto_1.cryptoWaitReady)();
    const seed = (0, util_crypto_1.mnemonicGenerate)();
    const account = await (0, exports.getKeyringFromSeed)(seed);
    return { seed: seed, address: account.address };
};
exports.generateSeed = generateSeed;
/**
 * @name getKeyringFromSeed
 * @summary Create a keyring from a seed
 * @param seed
 * @returns A keyring pair
 */
const getKeyringFromSeed = async (seed) => {
    await (0, util_crypto_1.cryptoWaitReady)();
    const keyring = new keyring_1.Keyring({ type: "sr25519" });
    return keyring.createFromUri(seed);
};
exports.getKeyringFromSeed = getKeyringFromSeed;
