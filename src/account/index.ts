import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"

/**
 * @name generateSeed
 * @summary Generate a new seed
 * @returns The new seed
 */
export const generateSeed = mnemonicGenerate

/**
 * @name getKeyringFromSeed
 * @summary               Create a keyring from a seed
 * @param seed            Mnemonic
 * @param hardPath        Hard path derivation
 * @param softPath        Soft path derivation
 * @param passwordPath    Password path derivation
 * @returns               A keyring pair
 */
export const getKeyringFromSeed = async (seed: string, hardPath?: string, softPath?: string, passwordPath?: string) => {
  await cryptoWaitReady()

  const _suri =
    seed +
    `${hardPath ? `//${hardPath}` : ""}` +
    `${softPath ? `/${softPath}` : ""}` +
    `${passwordPath ? `///${passwordPath}` : ""}`
  const keyring = new Keyring()
  return keyring.createFromUri(_suri, {}, "sr25519")
}
