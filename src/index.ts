import { getQueryAndSubscribe, isTransactionSuccess, runTransaction } from "./functions/blockchain"
import { getKeyringFromSeed } from "./functions/account"
import { unFormatBalance } from "./utils/polkadot"
import { chainQuery, txActions, txPallets } from "./constants"
import type { ISubmittableResult } from "@polkadot/types/types"

const quickTest = async () => {
  try {
    //test transaction
    const keyring = await getKeyringFromSeed(
      "soccer traffic version fault humor tackle bid tape obvious wild fish coin",
    )
    const hash = await runTransaction(
      txPallets.balances,
      txActions.transfer,
      ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5", await unFormatBalance(1)],
      keyring,
      (res: ISubmittableResult) => {
        if (res.status.isInBlock) {
          const isSuccess = isTransactionSuccess(res)
          console.log(res.status.toHuman())
          console.log(isSuccess)
        }
      },
    )
    console.log("hash", hash)

    //test query with subscribe
    await getQueryAndSubscribe(
      txPallets.system,
      chainQuery.account,
      ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5"],
      (res: any) => console.log("res", res),
    )
  } catch (err) {
    console.error(err)
  }
}

quickTest()

export * from "./functions/account"
export * from "./functions/blockchain"
