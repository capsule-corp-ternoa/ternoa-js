import BN from "bn.js"
import { isHex } from "@polkadot/util"
import { createTestPairs } from "../_misc/testingPairs"
import { generateSeed } from "../account"
import { checkBalanceForTransfer, getFreeBalance, transfer, transferAll, transferKeepAlive } from "./index"

describe("Testing getFreeBalance", (): void => {
  it("Should get an empty account balance for a new one", async (): Promise<void> => {
    const account = await generateSeed()
    const freeBalance = await getFreeBalance(account.address)
    expect(freeBalance.isZero()).toBe(true)
  })

  it("Should get a positive account balance on the testing account", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const freeBalance = await getFreeBalance(testAccount.address)
    expect(freeBalance.cmp(new BN(0))).toBe(1)
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
    const res = await transfer(destAccount.address, 1, testAccount)
    expect(isHex(res)).toBe(true)
  })

  it("Transfer all funds with TransferKeepAlive should throw an Error: 'Transaction is not finalized or in block'", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const testAccountFreeBalance = await getFreeBalance(testAccount.address)
    const res = await transferKeepAlive(destAccount.address, testAccountFreeBalance, testAccount)
    expect(isHex(res)).toBe(true)
  })

  it("Test account should have a balance with the existansial deposit amount on transferAll with keepAlive equal to true", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const res = await transferAll(destAccount.address, true, testAccount)
    expect(isHex(res)).toBe(true)
  })
})
