import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"
import { KeyringPair } from "@polkadot/keyring/types"

/**
 * @name generateSeed
 * @summary Generate a new account
 * @returns An object with the seed and the public address
 */
export const generateSeed = async (): Promise<{
  seed: string
  address: string
}> => {
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
export const getKeyringFromSeed = async (seed: string): Promise<KeyringPair> => {
  await cryptoWaitReady()
  const keyring = new Keyring({ type: "sr25519" })
  return keyring.createFromUri(seed)
}
