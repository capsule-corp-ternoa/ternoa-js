import { mnemonicValidate } from "@polkadot/util-crypto"
import { getKeyringFromSeed, generateSeed } from "./index"
import { isValidAddress } from "../../utils/blockchain"

test("Should generate a new seed", async () => {
  const account = await generateSeed()
  expect(mnemonicValidate(account.seed)).toBe(true)
  expect(isValidAddress(account.address)).toBe(true)
})

test("A valid seed should return a keypair", async () => {
  const account = await generateSeed()
  const keyring = await getKeyringFromSeed(account.seed)
  const address = keyring.address
  expect(address).toBe(account.address)
})
