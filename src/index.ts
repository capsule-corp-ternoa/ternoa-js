import { runTransaction } from "./functions/blockchain"
import { getKeyringFromSeed } from "./functions/account"
import { unFormatBalance } from "./utils/polkadot"
import { txActions, txPallets } from "./constants"

const quickTest = async () => {
  try {
    const keyring = await getKeyringFromSeed(
      "soccer traffic version fault humor tackle bid tape obvious wild fish coin",
    )
    const hash = await runTransaction(
      txPallets.balances,
      txActions.transfer,
      ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5", await unFormatBalance(1)],
      keyring,
    )
    console.log(hash)
  } catch (err) {
    console.log(err)
  }
}

quickTest()

export * from "./functions/account"
export * from "./functions/blockchain"
