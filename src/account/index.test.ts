import { mnemonicValidate } from "@polkadot/util-crypto"
import { getKeyringFromSeed, generateSeed } from "./index"
import { isValidAddress } from "../blockchain"

test("Should generate a new seed", async () => {
  const seed = generateSeed()
  expect(mnemonicValidate(seed)).toBe(true)
})

test("A valid seed should return a keypair", async () => {
  const seed = generateSeed()
  const keyring = await getKeyringFromSeed(seed)
  const address = keyring.address
  expect(isValidAddress(address)).toBe(true)
  expect(address).toBe(address)
})
