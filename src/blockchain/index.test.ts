// import { isHex } from "@polkadot/util"
// import { BN, isBN } from "bn.js"

// import {
//   batchTxHex,
//   batchAllTxHex,
//   consts,
//   createTxHex,
//   query,
//   signTx,
//   submitTx,
//   balanceToNumber,
//   numberToBalance,
//   isValidSignature,
//   getTxInitialFee,
// } from "."
// import { generateSeed, getKeyringFromSeed } from "../account"
// import { chainConstants, chainQuery, txActions, txPallets } from "../constants"
// import { createTestPairs } from "../_misc/testingPairs"

// describe("Testing consts", (): void => {
//   it("Should get the correct existensial deposit", async (): Promise<void> => {
//     const existensialDeposit = await consts(txPallets.balances, chainConstants.existentialDeposit)
//     expect(existensialDeposit).toBeDefined()
//   })
//   it("Should throw error with inexisting consts", async () => {
//     await expect(async () => {
//       await consts("toBe", "orNotToBe")
//     }).rejects.toThrow(TypeError)
//   })
// })

// describe("Testing query", (): void => {
//   it("Should be able to query storage data", async () => {
//     const data = await query(txPallets.system, chainQuery.number)
//     expect(data).toBeDefined()
//   })
//   it("Should throw error with inexisting storage", async () => {
//     await expect(async () => {
//       await query("toBe", "orNotToBe")
//     }).rejects.toThrow(TypeError)
//   })
// })

// describe("Checking funds to pay transaction gas fees on tx submit", (): void => {
//   it("Should throw an error if insufficient funds for fees or additional fees", async () => {
//     const account = await generateSeed()
//     const keyring = await getKeyringFromSeed(account.seed)
//     const txHex = await createTxHex(txPallets.balances, txActions.transfer, [keyring.address, "10000000000000000000"])
//     const signedTxHex = await signTx(keyring, txHex)
//     await expect(async () => {
//       await submitTx(signedTxHex)
//     }).rejects.toThrow(Error("Insufficient funds for fees or additional fees"))
//   })
// })

// describe("Testing fees getters", (): void => {
//   it("Should get the gas fee estimation for a transaction", async () => {
//     const { test: testAccount } = await createTestPairs()
//     const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
//       testAccount.address,
//       "1000000000000000000",
//     ])
//     const txGasFee = await getTxInitialFee(txHex, testAccount.address)
//     expect(isBN(txGasFee)).toBe(true)
//   })
// })

// describe("Testing create transaction", (): void => {
//   it("Should return a correct transaction hex", async () => {
//     const { test: testAccount } = await createTestPairs()
//     const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
//       testAccount.address,
//       "10000000000000000000",
//     ])
//     expect(isHex(txHex)).toBe(true)
//   })
//   it("Should throw error with incorrect pallet/extrinsic", async () => {
//     await expect(async () => {
//       await createTxHex("toBe", "orNotToBe")
//     }).rejects.toThrow(Error("toBe_orNotToBe not found, check the selected endpoint"))
//   })
// })

// describe("Testing sign transaction", (): void => {
//   it("Should return a correct signable transaction hex", async () => {
//     const { test: testAccount } = await createTestPairs()
//     const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
//       testAccount.address,
//       "10000000000000000000",
//     ])
//     const signedTxHex = await signTx(testAccount, txHex)
//     expect(isHex(signedTxHex)).toBe(true)
//   })
// })

// describe("Testing submit transaction", (): void => {
//   it("Should return a correct submited transaction hash hex", async () => {
//     const { test: testAccount, dest: destAccount } = await createTestPairs()
//     const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
//       destAccount.address,
//       "1000000000000000000",
//     ])
//     const signedTxHex = await signTx(testAccount, txHex)
//     const submitTxHex = await submitTx(signedTxHex)
//     expect(isHex(submitTxHex)).toBe(true)
//   })
// })

// describe("Testing run transaction", (): void => {
//   it("Should return a correct transaction hash hex ready to be signed", async () => {
//     const { dest: destAccount } = await createTestPairs()
//     const runTxHex = await runTx(txPallets.balances, txActions.transfer, [destAccount.address, "1000000000000000000"])
//     expect(isHex(runTxHex)).toBe(true)
//   })

//   it("Should return a correct submited transaction hash hex", async () => {
//     const { test: testAccount, dest: destAccount } = await createTestPairs()
//     const runTxHex = await runTx(
//       txPallets.balances,
//       txActions.transfer,
//       [destAccount.address, "1000000000000000000"],
//       testAccount,
//     )
//     expect(isHex(runTxHex)).toBe(true)
//   })
// })

// describe("Testing transactions batch and batchAll", (): void => {
//   it("Should return a correct transactions batch hex", async () => {
//     const { dest: destAccount } = await createTestPairs()
//     const txHex1 = await createTxHex(txPallets.balances, txActions.transfer, [
//       destAccount.address,
//       "1000000000000000000",
//     ])
//     const txHex2 = await createTxHex(txPallets.balances, txActions.transfer, [
//       destAccount.address,
//       "2000000000000000000",
//     ])
//     const batchTx = await batchTxHex([txHex1, txHex2])
//     expect(isHex(batchTx)).toBe(true)
//   })

//   it("Should return a correct transactions batchAll hex", async () => {
//     const { dest: destAccount } = await createTestPairs()
//     const txHex1 = await createTxHex(txPallets.balances, txActions.transfer, [
//       destAccount.address,
//       "1000000000000000000",
//     ])
//     const txHex2 = await createTxHex(txPallets.balances, txActions.transfer, [
//       destAccount.address,
//       "2000000000000000000",
//     ])
//     const batchAllTx = await batchAllTxHex([txHex1, txHex2])
//     expect(isHex(batchAllTx)).toBe(true)
//   })
// })

// describe("Testing balance format/unformat", (): void => {
//   it("Should format a BN into a number", async () => {
//     const res = await balanceToNumber(new BN("123432100000000000000000000"))
//     expect(res).toBe("123.4321 MCAPS")
//   })
//   it("Should unformat a number into a BN", async () => {
//     const res = await numberToBalance(123.4321)
//     expect(res).toEqual(new BN("123432100000000000000"))
//   })
// })

// describe("Testing isValidSignature", (): void => {
//   it("Should return true if a message passed as parameter has been signed by the passed address", async () => {
//     expect(
//       isValidSignature(
//         "This is a text message",
//         "0x2aeaa98e26062cf65161c68c5cb7aa31ca050cb5bdd07abc80a475d2a2eebc7b7a9c9546fbdff971b29419ddd9982bf4148c81a49df550154e1674a6b58bac84",
//         "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
//       ),
//     ).toBe(true)
//   })
//   it("Should return false if a message passed as parameter has not been signed by the passed address", async () => {
//     const { test: testAccount } = await createTestPairs()
//     expect(
//       isValidSignature(
//         "This is a text message",
//         "0x2aeaa98e26062cf65161c68c5cb7aa31ca050cb5bdd07abc80a475d2a2eebc7b7a9c9546fbdff971b29419ddd9982bf4148c81a49df550154e1674a6b58bac84",
//         testAccount.address,
//       ),
//     ).toBe(false)
//   })
// })
