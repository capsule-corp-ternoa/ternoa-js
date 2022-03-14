import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"
import { query } from "../blockchain"
import BN from "bn.js"
import { chainQuery, txPallets } from "../../constants"

/**
 * Generate a new account
 * @returns an object with the seed and the public address
 */
export const generateSeed = async () => {
  await cryptoWaitReady()
  const seed = mnemonicGenerate()
  const account = await getKeyringFromSeed(seed)
  return { seed: seed, address: account.address }
}

/**
 * Create a keyring from a seed
 * @param seed
 * @returns a keyring
 */
export const getKeyringFromSeed = async (seed: string) => {
  await cryptoWaitReady()
  const keyring = new Keyring({ type: "sr25519" })
  return keyring.createFromUri(seed)
}

/**
 * Get the balance of an account
 * @param address public address of the account to get balance for
 * @returns the free balance of the address
 */
export const getBalance = async (address: string) => {
  const balance: { free: BN } = ((await query(txPallets.system, chainQuery.account, [address])) as any).data
  return balance.free
}
