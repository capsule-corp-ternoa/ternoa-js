import { createTestPairs } from "../_misc/testingPairs"
import { generateSeed, getKeyringFromSeed } from "../account"
import { initializeApi } from "../blockchain"
import { checkBalanceForTransfer, getBalances, getTotalBalance, getTransferrableBalance } from "./storage"

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)
})

describe("Testing getBalances", (): void => {
  it("Should get an empty account free balance for a new one", async (): Promise<void> => {
    const seed = generateSeed()
    const keyring = await getKeyringFromSeed(seed)
    const balance = await getBalances(keyring.address)
    expect(balance.free.isZero()).toBe(true)
  })

  it("Should get a positive account free balance on the testing account", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const balance = await getBalances(testAccount.address)
    expect(balance.free.isZero()).toBe(false)
  })
})

describe("Testing getTotalBalance", (): void => {
  it("Should get an empty account balance for a new one", async (): Promise<void> => {
    const seed = generateSeed()
    const keyring = await getKeyringFromSeed(seed)
    const balance = await getTotalBalance(keyring.address)
    expect(balance.isZero()).toBe(true)
  })

  it("Should get a positive account balance on the testing account", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const balance = await getTotalBalance(testAccount.address)
    expect(balance.isZero()).toBe(false)
  })
})

describe("Testing getTransferrableBalance", (): void => {
  it("Should get an empty account balance for a new one", async (): Promise<void> => {
    const seed = generateSeed()
    const keyring = await getKeyringFromSeed(seed)
    const balance = await getTransferrableBalance(keyring.address)
    expect(balance.isZero()).toBe(true)
  })

  it("Should get a positive account balance on the testing account", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const balance = await getTransferrableBalance(testAccount.address)
    expect(balance.isZero()).toBe(false)
  })
})

describe("Testing checkBalanceForTransfer", (): void => {
  it("Insufficient funds to transfer", async (): Promise<void> => {
    const seed = generateSeed()
    const keyring = await getKeyringFromSeed(seed)
    const hasEnoughFunds = await checkBalanceForTransfer(keyring.address, 1)
    expect(hasEnoughFunds).toBe(false)
  })

  it("Sufficient funds to transfer", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const hasEnoughFunds = await checkBalanceForTransfer(testAccount.address, 1)
    expect(hasEnoughFunds).toBe(true)
  })
})
