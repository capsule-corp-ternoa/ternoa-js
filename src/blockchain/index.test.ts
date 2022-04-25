import { isHex } from "@polkadot/util"
import type { ISubmittableResult } from "@polkadot/types/types"

import { batchTxHex, batchAllTxHex, consts, createTxHex, isTransactionSuccess, query, runTx, signTx, submitTx } from "."
import { chainConstants, chainQuery, txActions, txPallets } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"

describe("Testing consts", (): void => {
  it("Should get the correct existensial deposit", async (): Promise<void> => {
    const existensialDeposit = await consts(txPallets.balances, chainConstants.existentialDeposit)
    expect(existensialDeposit).toBeDefined()
  })
  it("Should throw error with inexisting consts", async () => {
    await expect(async () => {
      await consts("toBe", "orNotToBe")
    }).rejects.toThrow(TypeError)
  })
})

describe("Testing query", (): void => {
  it("Should be able to query storage data", async () => {
    const data = await query(txPallets.nfts, chainQuery.nftMintFee)
    expect(data).toBeDefined()
  })
  it("Should throw error with inexisting storage", async () => {
    await expect(async () => {
      await query("toBe", "orNotToBe")
    }).rejects.toThrow(TypeError)
  })
})

describe("Testing create transaction", (): void => {
  it("Should return a correct transaction hex", async () => {
    const { test: testAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      testAccount.address,
      "10000000000000000000",
    ])
    expect(isHex(txHex)).toBe(true)
  })
  it("Should throw error with incorrect pallet/extrinsic", async () => {
    await expect(async () => {
      await createTxHex("toBe", "orNotToBe")
    }).rejects.toThrow(Error("toBe_orNotToBe not found, check the selected endpoint"))
  })
})

describe("Testing sign transaction", (): void => {
  it("Should return a correct signable transaction hex", async () => {
    const { test: testAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      testAccount.address,
      "10000000000000000000",
    ])
    const signedTxHex = await signTx(testAccount, txHex)
    expect(isHex(signedTxHex)).toBe(true)
  })
})

describe("Testing submit transaction", (): void => {
  it("Should return a correct submited transaction hash hex", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "1000000000000000000",
    ])
    const signedTxHex = await signTx(testAccount, txHex)
    const submitTxHex = await submitTx(signedTxHex)
    expect(isHex(submitTxHex)).toBe(true)
  })

  it("Should return a correct submited transaction hash hex with in block callback notification", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "10000000000000000000",
    ])
    const signedTxHex = await signTx(testAccount, txHex)
    const submitTxHex = await submitTx(signedTxHex, (res: ISubmittableResult) => {
      if (res.status.isInBlock) {
        const { success } = isTransactionSuccess(res)
        expect(success).toBe(true)
      } else {
        try {
          const { success } = isTransactionSuccess(res)
          expect(success).toBe(true)
        } catch (err) {
          expect(err).toEqual(Error("Transaction is not finalized or in block"))
        }
      }
    })
    expect(isHex(submitTxHex)).toBe(true)
  })

  it("Should reject the transaction if the free balance is lower than the amount specified", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "100000000000000000000000000",
    ])
    const signedTxHex = await signTx(testAccount, txHex)
    const submitTxHex = await submitTx(signedTxHex, (res: ISubmittableResult) => {
      if (res.status.isInBlock) {
        const { success } = isTransactionSuccess(res)
        expect(success).toBe(false)
      } else {
        try {
          const { success } = isTransactionSuccess(res)
          expect(success).toBe(false)
        } catch (err) {
          expect(err).toEqual(Error("Transaction is not finalized or in block"))
        }
      }
    })
    expect(isHex(submitTxHex)).toBe(true)
  })
})

describe("Testing run transaction", (): void => {
  it("Should return a correct transaction hash hex ready to be signed", async () => {
    const { dest: destAccount } = await createTestPairs()
    const runTxHex = await runTx(txPallets.balances, txActions.transfer, [destAccount.address, "1000000000000000000"])
    expect(isHex(runTxHex)).toBe(true)
  })

  it("Should return a correct submited transaction hash hex", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const runTxHex = await runTx(
      txPallets.balances,
      txActions.transfer,
      [destAccount.address, "1000000000000000000"],
      testAccount,
    )
    expect(isHex(runTxHex)).toBe(true)
  })
})

describe("Testing transaction status", (): void => {
  it("Should throw an error if transaction is not in block or finalized", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "1000000000000000000",
    ])
    const signedTxHex = await signTx(testAccount, txHex)
    const submitTxHex = await submitTx(signedTxHex, async (res: ISubmittableResult) => {
      if (res.status.isReady) {
        await expect(async () => {
          await isTransactionSuccess(res)
        }).rejects.toThrow(Error("Transaction is not finalized or in block"))
      }
    })
    expect(isHex(submitTxHex)).toBe(true)
  })
})

describe("Testing transactions batch and batchAll", (): void => {
  it("Should return a correct transactions batch hex", async () => {
    const { dest: destAccount } = await createTestPairs()
    const txHex1 = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "1000000000000000000",
    ])
    const txHex2 = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "2000000000000000000",
    ])
    const batchTx = await batchTxHex([txHex1, txHex2])
    expect(isHex(batchTx)).toBe(true)
  })

  it("Should return a correct transactions batchAll hex", async () => {
    const { dest: destAccount } = await createTestPairs()
    const txHex1 = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "1000000000000000000",
    ])
    const txHex2 = await createTxHex(txPallets.balances, txActions.transfer, [
      destAccount.address,
      "2000000000000000000",
    ])
    const batchAllTx = await batchAllTxHex([txHex1, txHex2])
    expect(isHex(batchAllTx)).toBe(true)
  })
})
