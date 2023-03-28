import { createTestPairs } from "../_misc/testingPairs"
import { initializeApi, numberToBalance, query } from "../blockchain"
import { chainQuery, txPallets, WaitUntil } from "../constants"
import { createNft } from "../nft"
import { createMarketplace } from "../marketplace"
import { MarketplaceKind } from "../marketplace/enum"

import { getMinAuctionDuration } from "./constants"
import { addBid, buyItNow, cancelAuction, createAuction, removeBid } from "./extrinsics"

const TEST_DATA = {
  marketplaceId: 0,
  nftId: 0,
  startBlock: 0,
  endBlock: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create some Test NFT, Marketplace and Auction
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("Test Auctioned  NFT", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  const mEvent = await createMarketplace(MarketplaceKind.Public, testAccount, WaitUntil.BlockInclusion)
  TEST_DATA.nftId = nEvent.nftId
  TEST_DATA.marketplaceId = mEvent.marketplaceId
})

describe("Testing to create an auction & buy NFT directly with buyItNow", (): void => {
  it("Testing to create an auction", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const currentBlock = await query(txPallets.system, chainQuery.number)
    const auctionMinDuration = getMinAuctionDuration()
    const auctionStartBlock = Number.parseInt(currentBlock.toString()) + 1
    const auctionEndBlock = auctionStartBlock + auctionMinDuration
    const startPrice = numberToBalance(1)
    const buyItPrice = numberToBalance(10)
    const aEvent = await createAuction(
      TEST_DATA.nftId,
      TEST_DATA.marketplaceId,
      auctionStartBlock,
      auctionEndBlock,
      startPrice,
      buyItPrice,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    TEST_DATA.startBlock = auctionStartBlock
    TEST_DATA.endBlock = auctionEndBlock

    expect(
      aEvent.method === "AuctionCreated" &&
        aEvent.creator === testAccount.address &&
        aEvent.nftId === TEST_DATA.nftId &&
        aEvent.marketplaceId === TEST_DATA.marketplaceId &&
        aEvent.startPrice === startPrice.toString() &&
        aEvent.startPriceRounded === 1 &&
        aEvent.buyItPrice === buyItPrice.toString() &&
        aEvent.buyItPriceRounded === 10 &&
        aEvent.startBlock === TEST_DATA.startBlock &&
        aEvent.endBlock === TEST_DATA.endBlock,
    ).toBe(true)
  })

  it("Testing to buy an Auctioned  NFT directly with buyItNow", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    const buyItPrice = 10
    const buyItPriceBN = numberToBalance(10)
    const zeroBN = numberToBalance(0)
    const aEvent = await buyItNow(TEST_DATA.nftId, buyItPriceBN, destAccount, WaitUntil.BlockInclusion)

    expect(
      aEvent.method === "AuctionCompleted" &&
        aEvent.newOwner === destAccount.address &&
        aEvent.nftId === TEST_DATA.nftId &&
        aEvent.amount === buyItPriceBN.toString() &&
        aEvent.amountRounded === buyItPrice &&
        aEvent.marketplaceCut === zeroBN.toString() &&
        aEvent.marketplaceCutRounded === 0 &&
        aEvent.royaltyCut === zeroBN.toString() &&
        aEvent.royaltyCutRounded === 0,
    ).toBe(true)
  })
})

it("Testing to cancel an auction", async (): Promise<void> => {
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("Test Auctioned  NFT", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  const currentBlock = await query(txPallets.system, chainQuery.number)
  const auctionMinDuration = getMinAuctionDuration()
  const auctionStartBlock = Number.parseInt(currentBlock.toString()) + 10
  const auctionEndBlock = auctionStartBlock + auctionMinDuration
  const startPrice = numberToBalance(1)
  const buyItPrice = numberToBalance(10)
  await createAuction(
    nEvent.nftId,
    TEST_DATA.marketplaceId,
    auctionStartBlock,
    auctionEndBlock,
    startPrice,
    buyItPrice,
    testAccount,
    WaitUntil.BlockInclusion,
  )
  const aEvent = await cancelAuction(nEvent.nftId, testAccount, WaitUntil.BlockInclusion)

  expect(aEvent.method === "AuctionCancelled" && aEvent.nftId === nEvent.nftId).toBe(true)
})

describe("Testing to create an auction & add/update/remove bids", (): void => {
  it("Testing to create an auction & add a bid", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const nEvent = await createNft("Test Auctioned NFT", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
    const currentBlock = await query(txPallets.system, chainQuery.number)
    const auctionMinDuration = getMinAuctionDuration()
    const auctionStartBlock = Number.parseInt(currentBlock.toString()) + 1
    const auctionEndBlock = auctionStartBlock + auctionMinDuration * 2
    const startPrice = numberToBalance(1)
    const buyItPrice = numberToBalance(10)
    await createAuction(
      nEvent.nftId,
      TEST_DATA.marketplaceId,
      auctionStartBlock,
      auctionEndBlock,
      startPrice,
      buyItPrice,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    TEST_DATA.nftId = nEvent.nftId

    const bidAmount = 10
    const bidAmountBN = numberToBalance(10)
    const aEvent = await addBid(nEvent.nftId, bidAmount, destAccount, WaitUntil.BlockInclusion)

    expect(
      aEvent.method === "BidAdded" &&
        aEvent.nftId === nEvent.nftId &&
        aEvent.amount === bidAmountBN.toString() &&
        aEvent.amountRounded === bidAmount &&
        aEvent.bidder === destAccount.address,
    ).toBe(true)
  })

  it("Testing to remove a bid", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    const bidAmount = 10
    const bidAmountBN = numberToBalance(bidAmount)
    const aEvent = await removeBid(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)

    expect(
      aEvent.method === "BidRemoved" &&
        aEvent.nftId === TEST_DATA.nftId &&
        aEvent.amount === bidAmountBN.toString() &&
        aEvent.amountRounded === bidAmount &&
        aEvent.bidder === destAccount.address,
    ).toBe(true)
  })
})
