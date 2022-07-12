import BN from "bn.js"
import { createTestPairs } from "../_misc/testingPairs"
import { generateSeed } from "../account"
import { checkBalanceForTransfer, getFreeBalance } from "./storage"

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

describe("Testing getFreeBalance", (): void => {
  it("Insufficient funds to transfer", async (): Promise<void> => {
    const account = await generateSeed()
    const hasEnoughFunds = await checkBalanceForTransfer(account.address, 1)
    expect(hasEnoughFunds).toBe(false)
  })

  it("Sufficient funds to transfer", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const hasEnoughFunds = await checkBalanceForTransfer(testAccount.address, 1)
    expect(hasEnoughFunds).toBe(true)
  })
})
