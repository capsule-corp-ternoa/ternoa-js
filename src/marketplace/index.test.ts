import { buyNft, createMarketplace, listNft, setMarketplaceKind, setMarketplaceOwner, unlistNft } from "./extrinsics"
import { initializeApi } from "../blockchain"
import { MarketplaceKind, WaitUntil } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"
import { createNft, getNftData } from "../nft"

const TEST_DATA = {
  nftId: 0,
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

  it("Testing to update the marketplace configuration", async (): Promise<void> => {
    // const { test: testAccount, dest: destAccount } = await createTestPairs()
    // const mpEvent = await setMarketplaceOwner(
    //   TEST_DATA.marketplaceId,
    //   testAccount.address,
    //   destAccount,
    //   WaitUntil.BlockInclusion,
    // )
    // expect(mpEvent.marketplaceId === TEST_DATA.marketplaceId && mpEvent.owner === destAccount.address).toBe(true)
  })

  it("Testing to set new marketplace owner", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const mpEvent = await setMarketplaceOwner(
      TEST_DATA.marketplaceId,
      destAccount.address,
      testAccount,
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

describe("Testing to List, Unlist, Buy an NFT on the Marketplace", (): void => {
  it("Testing to List an NFT on a marketplace", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    await setMarketplaceKind(TEST_DATA.marketplaceId, MarketplaceKind.Public, destAccount, WaitUntil.BlockInclusion)
    const nEvent = await createNft(
      "Testing - Create an NFT from SDK for listing",
      0,
      undefined,
      false,
      destAccount,
      WaitUntil.BlockInclusion,
    )
    TEST_DATA.nftId = nEvent.nftId
    await listNft(TEST_DATA.nftId, TEST_DATA.marketplaceId, 10, destAccount, WaitUntil.BlockInclusion)
    const nData = await getNftData(TEST_DATA.nftId)
    expect(nData?.state.listedForSale).toBe(true)
  })

  it("Testing to Unlist an NFT on a marketplace", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    await unlistNft(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const nData = await getNftData(TEST_DATA.nftId)
    expect(nData?.state.listedForSale).toBe(false)
  })

  it("Testing to Buy an NFT from a marketplace", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await listNft(TEST_DATA.nftId, TEST_DATA.marketplaceId, 10, destAccount, WaitUntil.BlockInclusion)
    const mpEvent = await buyNft(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)
    const nData = await getNftData(TEST_DATA.nftId)
    expect(mpEvent.marketplaceId === TEST_DATA.marketplaceId && nData?.owner === testAccount.address).toBe(true)
  })
})