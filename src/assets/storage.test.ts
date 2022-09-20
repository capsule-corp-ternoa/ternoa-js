import { getAssetBalance } from "./storage"

import { createTestPairs } from "../_misc/testingPairs"
import { initializeApi } from "../blockchain"

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)
})

describe("Testing getAssetBalances", (): void => {
  it("Should get an empty asset balance", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const balance = await getAssetBalance(0, testAccount.address)
    expect(balance).toBe(null)
  })
})
