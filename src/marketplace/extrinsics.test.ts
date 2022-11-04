import { createTestPairs } from "../_misc/testingPairs"
import { initializeApi, numberToBalance } from "../blockchain"
import { WaitUntil } from "../constants"
import { createCollection, createNft, getNftData } from "../nft"

import { MarketplaceConfigAction, MarketplaceConfigFeeType, MarketplaceKind } from "./enum"
import {
  buyNft,
  createMarketplace,
  listNft,
  setMarketplaceConfiguration,
  setMarketplaceKind,
  setMarketplaceOwner,
  unlistNft,
} from "./extrinsics"

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
    expect(
      mpEvent.marketplaceId > 0 && mpEvent.kind === MarketplaceKind.Public && mpEvent.owner === testAccount.address,
    ).toBe(true)
  })

  it("Testing to set all marketplace parameters configuration", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const { collectionId } = await createCollection(
      "SDK_COLLECTION_TESTING",
      undefined,
      destAccount,
      WaitUntil.BlockInclusion,
    )
    const mpEvent = await setMarketplaceConfiguration(
      TEST_DATA.marketplaceId,
      { [MarketplaceConfigAction.Set]: { [MarketplaceConfigFeeType.Percentage]: 10 } },
      { [MarketplaceConfigAction.Set]: { [MarketplaceConfigFeeType.Flat]: 100 } },
      { [MarketplaceConfigAction.Set]: [destAccount.address] },
      { [MarketplaceConfigAction.Set]: "SDK_MARKETPLACE_CONFIG_TEST" },
      { [MarketplaceConfigAction.Set]: [collectionId] },
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const listingFee = (await numberToBalance(100)).toString()
    expect(
      mpEvent.marketplaceId === TEST_DATA.marketplaceId &&
        mpEvent.commissionFee === "10" &&
        mpEvent.commissionFeeRounded === 10 &&
        mpEvent.commissionFeeType === MarketplaceConfigFeeType.Percentage &&
        mpEvent.listingFee === listingFee &&
        mpEvent.listingFeeRounded === 100 &&
        mpEvent.listingFeeType === MarketplaceConfigFeeType.Flat &&
        mpEvent.accountList?.length === 1 &&
        mpEvent.accountList?.includes(destAccount.address) &&
        mpEvent.offchainData === "SDK_MARKETPLACE_CONFIG_TEST" &&
        mpEvent.collectionList?.includes(collectionId),
    ).toBe(true)
  })
  it("Testing to Remove and keep(Noop) the marketplace parameters configuration", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const mpEvent = await setMarketplaceConfiguration(
      TEST_DATA.marketplaceId,
      MarketplaceConfigAction.Noop,
      MarketplaceConfigAction.Remove,
      MarketplaceConfigAction.Remove,
      MarketplaceConfigAction.Noop,
      MarketplaceConfigAction.Remove,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    expect(
      mpEvent.commissionFee === undefined &&
        mpEvent.commissionFeeRounded === undefined &&
        mpEvent.commissionFeeType === undefined &&
        mpEvent.listingFee === null &&
        mpEvent.listingFeeRounded === null &&
        mpEvent.listingFeeType === null &&
        mpEvent.accountList?.length === 0 &&
        mpEvent.offchainData === undefined &&
        mpEvent.collectionList?.length === 0,
    ).toBe(true)
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
    expect(mpEvent.marketplaceId === TEST_DATA.marketplaceId && mpEvent.kind === MarketplaceKind.Private).toBe(true)
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
    const mpEvent = await listNft(TEST_DATA.nftId, TEST_DATA.marketplaceId, 10, destAccount, WaitUntil.BlockInclusion)
    const nData = await getNftData(TEST_DATA.nftId)
    const price = (await numberToBalance(10)).toString()
    expect(
      mpEvent.nftId === TEST_DATA.nftId &&
        mpEvent.marketplaceId === TEST_DATA.marketplaceId &&
        mpEvent.price === price &&
        mpEvent.priceRounded === 10 &&
        mpEvent.commissionFee === "10" &&
        mpEvent.commissionFeeRounded === 10 &&
        mpEvent.commissionFeeType === MarketplaceConfigFeeType.Percentage &&
        nData?.state.isListed,
    ).toBe(true)
  })

  it("Testing to Unlist an NFT on a marketplace", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    const mpEvent = await unlistNft(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const nData = await getNftData(TEST_DATA.nftId)
    expect(mpEvent.nftId === TEST_DATA.nftId && nData?.state.isListed).toBe(false)
  })

  it("Testing to Buy an NFT from a marketplace", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await listNft(TEST_DATA.nftId, TEST_DATA.marketplaceId, 10, destAccount, WaitUntil.BlockInclusion)
    const mpEvent = await buyNft(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)
    const nData = await getNftData(TEST_DATA.nftId)
    const listedPrice = (await numberToBalance(10)).toString()
    const marketplaceCut = (await numberToBalance(1)).toString()
    const royaltyCut = (await numberToBalance(0)).toString()
    expect(
      mpEvent.nftId === TEST_DATA.nftId &&
        mpEvent.marketplaceId === TEST_DATA.marketplaceId &&
        mpEvent.buyer === testAccount.address &&
        mpEvent.listedPrice === listedPrice &&
        mpEvent.listedPriceRounded === 10 &&
        mpEvent.marketplaceCut === marketplaceCut &&
        mpEvent.marketplaceCutRounded === 1 &&
        mpEvent.royaltyCut === royaltyCut &&
        mpEvent.royaltyCutRounded === 0 &&
        nData?.owner === testAccount.address,
    ).toBe(true)
  })
})
