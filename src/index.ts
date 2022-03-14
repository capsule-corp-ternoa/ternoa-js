// import type { ISubmittableResult } from "@polkadot/types/types"
// import { unFormatBalance } from "./utils/blockchain"
// import { chainQuery, txActions, txPallets } from "./constants"
// import * as account from "./functions/account"
// import * as blockchain from "./functions/blockchain"

// const test = async () => {
//   try {
//     //test transaction
//     // pub address : 5GesFQSwhmuMKAHcDrfm21Z5xrq6kW93C1ch2Xosq1rXx2Eh
//     const keyring = await account.getKeyringFromSeed(
//       "soccer traffic version fault humor tackle bid tape obvious wild fish coin",
//     )
//     const hash = await blockchain.runTx(
//       txPallets.balances,
//       txActions.transfer,
//       ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5", await unFormatBalance(1)],
//       keyring,
//       (res: ISubmittableResult) => {
//         if (res.status.isInBlock) {
//           const isSuccess = blockchain.isTransactionSuccess(res)
//           console.log(res.status.toHuman())
//           console.log(isSuccess)
//         }
//       },
//     )
//     console.log("hash", hash)
//     console.log(await blockchain.query(txPallets.system,
//       chainQuery.account,
//       ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5"]))
//     //test query with subscribe
//     let a = 0
//     const unsub = await blockchain.query(
//       txPallets.system,
//       chainQuery.account,
//       ["5CDGXH8Q9DzD3TnATTG6qm6f4yR1kbECBGUmh2XbEBQ8Jfa5"],
//       (res: any) => {
//         console.log("res", a)
//         a += 1
//         if (a >=2){
//           blockchain.safeUnsubscribe(unsub)
//         }
//       },
//     )
//     console.log("unsub", unsub)

//   } catch (err) {
//     console.error(err)
//   }
// }

// test()

export * as account from "./functions/account"
export * as blockchain from "./functions/blockchain"
export * as capsule from "./functions/capsule"
export * as fee from "./functions/fee"
export * as marketplace from "./functions/marketplace"
export * as nft from "./functions/nft"
export * as utils from "./utils/blockchain"
export * as constants from "./constants"
