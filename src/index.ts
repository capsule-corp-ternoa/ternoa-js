import { unFormatBalance } from "./utils/polkadot"
import type { ISubmittableResult } from "@polkadot/types/types"
import { chainQuery, txActions, txPallets } from "./constants"
import * as account from "./functions/account"
import * as blockchain from "./functions/blockchain"

const test = async () => {
  try {
    //test transaction
    const keyring = await account.getKeyringFromSeed(
      "soccer traffic version fault humor tackle bid tape obvious wild fish coin",
    )
    const hash = await blockchain.runTransaction(
      txPallets.balances,
      txActions.transfer,
      ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5", await unFormatBalance(1)],
      keyring,
      (res: ISubmittableResult) => {
        if (res.status.isInBlock) {
          const isSuccess = blockchain.isTransactionSuccess(res)
          console.log(res.status.toHuman())
          console.log(isSuccess)
        }
      },
    )
    console.log("hash", hash)

    //test query with subscribe
    await blockchain.getQueryAndSubscribe(
      txPallets.system,
      chainQuery.account,
      ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5"],
      (res: any) => console.log("res", res),
    )
  } catch (err) {
    console.error(err)
  }
}

test()

export * as account from "./functions/account"
export * as blockchain from "./functions/blockchain"
export * as capsule from "./functions/capsule"
export * as marketplace from "./functions/marketplace"
export * as nft from "./functions/nft"
