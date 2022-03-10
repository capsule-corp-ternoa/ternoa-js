import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"
import { getQuery } from "../blockchain"
import BN from "bn.js"
import { chainQuery, txPallets } from "../../constants"

export const generateSeed = async () => {
  await cryptoWaitReady()
  const seed = mnemonicGenerate()
  const account = await getKeyringFromSeed(seed)
  return { seed: seed, address: account.address }
}

export const getKeyringFromSeed = async (seed: string) => {
  await cryptoWaitReady()
  const keyring = new Keyring({ type: "sr25519" })
  return keyring.createFromUri(seed)
}

//TO TEST
export const getBalance = async (address: string) => {
  const balance: { free: BN } = ((await getQuery(txPallets.system, chainQuery.account, [address])) as any).data
  return balance.free
}
