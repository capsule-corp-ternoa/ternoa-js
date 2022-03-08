import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"

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
