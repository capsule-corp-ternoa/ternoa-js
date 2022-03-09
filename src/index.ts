import {
  createSignableTransaction,
  createTransaction,
  getSignedTransaction,
  submitTransaction,
} from "./functions/blockchain"
import { generateSeed, getKeyringFromSeed } from "./functions/account"
import { unFormatBalance } from "./utils/polkadot"

const quickTest = async () => {
  try {
    // const seed = await generateSeed()
    const keyring = await getKeyringFromSeed(
      "soccer traffic version fault humor tackle bid tape obvious wild fish coin",
    )
    const tx = await createTransaction("balances", "transfer", [
      "5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5",
      await unFormatBalance(100),
    ])
    const payload = await createSignableTransaction(keyring.address, tx)
    const signedPayload = await getSignedTransaction(
      "soccer traffic version fault humor tackle bid tape obvious wild fish coin",
      payload,
    )
    // const hash = await submitTransaction(tx, keyring.address, signedPayload, payload)
    // console.log(hash.toHex())
  } catch (err) {
    console.log(err)
  }
}

quickTest()

export * from "./functions/account"
export * from "./functions/blockchain"
