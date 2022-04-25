import BN from "bn.js"
import type { ISubmittableResult } from "@polkadot/types/types"
import { chainConstants, txPallets } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"
import { generateSeed } from "../account"
import { consts, isTransactionSuccess } from "../blockchain"
import { checkBalanceForTransfer, getBalance, transfer, transferAll, transferKeepAlive } from "./index"

describe("Testing getBalance", (): void => {
  it("Should get an empty account balance for a new one", async (): Promise<void> => {
    const account = await generateSeed()
    const balance = await getBalance(account.address)
    expect(balance.isZero()).toBe(true)
  })

  it("Should get a positive account balance on the testing account", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const balance = await getBalance(testAccount.address)
    expect(balance.cmp(new BN(0))).toBe(1)
  })
})

describe("Testing checkBalanceForTransfer", (): void => {
  it("A negative value should throw an Error: 'Value needs to be greater than 0'", async (): Promise<void> => {
    const account = await generateSeed()
    await expect(checkBalanceForTransfer(account.address, -1)).rejects.toThrow(
      Error("Value needs to be greater than 0"),
    )
  })

  it("A '0' value should throw an Error: 'Value needs to be greater than 0'", async (): Promise<void> => {
    const account = await generateSeed()
    await expect(checkBalanceForTransfer(account.address, 0)).rejects.toThrow(Error("Value needs to be greater than 0"))
  })

  it("Insufficient funds on a new account balance should throw an Error: 'Insufficient funds to transfer", async (): Promise<void> => {
    const account = await generateSeed()
    await expect(checkBalanceForTransfer(account.address, 1)).rejects.toThrow(Error("Insufficient funds to transfer"))
  })
})

describe("Testing transfer", (): void => {
  it("Transfer some funds from the testing account", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await transfer(testAccount.address, destAccount.address, 1, testAccount, (res: ISubmittableResult) => {
      if (res.status.isInBlock) {
        const { success } = isTransactionSuccess(res)
        expect(success).toBe(true)
      }
    })
  })

  it("Transfer all funds with TransferKeepAlive should throw an Error: 'Transaction is not finalized or in block'", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const testAccountBalance = await getBalance(testAccount.address)

    await transferKeepAlive(
      testAccount.address,
      destAccount.address,
      testAccountBalance,
      testAccount,
      (res: ISubmittableResult) => {
        if (!res.status.isInBlock) {
          try {
            isTransactionSuccess(res)
          } catch (err) {
            expect(err).toEqual(Error("Transaction is not finalized or in block"))
          }
        }
      },
    )
  })

  it("Test account should have a balance with the existansial deposit amount on transferAll with keepAlive equal to true", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const existensialDeposit = await consts(txPallets.balances, chainConstants.existentialDeposit)

    await transferAll(destAccount.address, true, testAccount, async (res: ISubmittableResult) => {
      if (res.status.isInBlock) {
        const { success } = isTransactionSuccess(res)
        expect(success).toBe(true)
        const balance = await getBalance(testAccount.address)
        expect(balance.toString()).toEqual(existensialDeposit.toString())
      }
    })
  })
})
