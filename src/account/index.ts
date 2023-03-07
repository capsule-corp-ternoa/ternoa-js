import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"
import { IKeyringPair } from "@polkadot/types/types"

/**
 * @name generateSeed
 * @summary Generate a new seed
 * @returns The new seed
 */
export const generateSeed = mnemonicGenerate

/**
 * @name generateAccount
 * @summary Generate a new account
 * @returns An object with the seed and the public address
 */
export const generateAccount = async (): Promise<{
  seed: string
  keyring: IKeyringPair
}> => {
  await cryptoWaitReady()
  const seed = mnemonicGenerate()
  const keyring = await getKeyringFromSeed(seed)
  return { seed: seed, keyring }
}

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
