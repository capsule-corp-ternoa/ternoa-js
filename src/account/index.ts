import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"

/**
 * @name generateSeed
 * @summary Generate a new account
 * @returns An object with the seed and the public address
 */
export const generateSeed = async () => {
  await cryptoWaitReady()
  const seed = mnemonicGenerate()
  const account = await getKeyringFromSeed(seed)
  return { seed: seed, address: account.address }
}

/**
 * @name getKeyringFromSeed
 * @summary Create a keyring from a seed
 * @param seed
 * @returns A keyring pair
 */
export const getKeyringFromSeed = async (seed: string) => {
  await cryptoWaitReady()
  const keyring = new Keyring({ type: "sr25519" })
  return keyring.createFromUri(seed)
}
