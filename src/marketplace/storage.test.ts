import { initializeApi } from "../blockchain"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { createTestPairs } from "../_misc/testingPairs"
import { MarketplaceKind } from "./enum"
import { createMarketplace, listNft } from "./extrinsics"
import { getMarketplaceMintFee, getNextMarketplaceId, getMarketplaceData, getNftForSale } from "./storage"

const TEST_DATA = {
  marketplaceId: 0,
  nftId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create some data to test Marketplace queries.
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  const mEvent = await createMarketplace(MarketplaceKind.Public, testAccount, WaitUntil.BlockInclusion)
  TEST_DATA.nftId = nEvent.nftId
  TEST_DATA.marketplaceId = mEvent.marketplaceId
})

it("Marketplace Mint Fee storage should exist and it should not be null", async () => {
  const actual = await getMarketplaceMintFee()
  expect(actual != undefined).toBe(true)
})

it("Next Marketplace ID storage should exist and it should not be null", async () => {
  const actual = await getNextMarketplaceId()
  expect(actual != undefined).toBe(true)
})

describe("Testing Marketplace data", (): void => {
  it("Should return null if an invalid Marketplace ID is passed", async () => {
    const maybeMarketplace = await getMarketplaceData(1000000)
    expect(maybeMarketplace).toBeNull()
  })
  it("Should return the NFT Data when the Marketplace ID exists", async () => {
    const maybeMarketplace = await getMarketplaceData(TEST_DATA.marketplaceId)
    expect(maybeMarketplace != null).toBe(true)
  })
})

describe("Testing NFT for sale data", (): void => {
  it("Should return null if an invalid NFT ID is passed", async () => {
    const maybeNFTListed = await getNftForSale(1000000)
    expect(maybeNFTListed).toBeNull()
  })
  it("Should return the NFT Data when the Marketplace ID exists", async () => {
    const { test: testAccount } = await createTestPairs()
    await listNft(TEST_DATA.nftId, TEST_DATA.marketplaceId, 13, testAccount, WaitUntil.BlockInclusion)
    const maybeNFTListed = await getNftForSale(TEST_DATA.nftId)
    expect(maybeNFTListed != null).toBe(true)
  })
})
