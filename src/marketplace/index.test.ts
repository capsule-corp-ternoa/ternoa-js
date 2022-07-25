import { createMarketplace, setMarketplaceKind, setMarketplaceOwner } from "./extrinsics"
import { initializeApi } from "../blockchain"
import { MarketplaceKind, WaitUntil } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"

const TEST_DATA = {
  marketplaceId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)
})

describe("Testing Marketplace extrinsics", (): void => {
  it("Testing to create a marketplace", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const mpEvent = await createMarketplace(MarketplaceKind.Public, testAccount, WaitUntil.BlockInclusion)
    TEST_DATA.marketplaceId = mpEvent.marketplaceId
    expect(mpEvent.marketplaceId > 0).toBe(true)
  })

  it("Testing to set new marketplace owner", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const mpEvent = await setMarketplaceOwner(
      TEST_DATA.marketplaceId,
      testAccount.address,
      destAccount,
      WaitUntil.BlockInclusion,
    )
    expect(mpEvent.marketplaceId === TEST_DATA.marketplaceId && mpEvent.owner === destAccount.address).toBe(true)
  })

  it("Testing to set marketplace kind", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    const mpEvent = await setMarketplaceKind(
      TEST_DATA.marketplaceId,
      MarketplaceKind.Private,
      destAccount,
      WaitUntil.BlockInclusion,
    )
    expect(mpEvent.marketplaceId === TEST_DATA.marketplaceId && mpEvent.kind === "Private").toBe(true)
  })
})
