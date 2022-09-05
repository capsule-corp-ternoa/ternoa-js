import { createTestPairs } from "../_misc/testingPairs"
import { initializeApi, numberToBalance, query } from "../blockchain"
import { chainQuery, txPallets, WaitUntil } from "../constants"
import { createNft } from "../nft"
import { createMarketplace } from "../marketplace"
import { MarketplaceKind } from "../marketplace/enum"

import { getMinAuctionDuration } from "./constants"
import { createAuction } from "./extrinsics"
import { getAuctionData, getAuctionDeadline } from "./storage"

const TEST_DATA = {
  marketplaceId: 3,
  nftId: 0,
  startBlock: 0,
  endBlock: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create some Test NFT, Marketplace and Auction
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("Test Auctionned NFT", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  const mEvent = await createMarketplace(MarketplaceKind.Public, testAccount, WaitUntil.BlockInclusion)
  const currentBlock = await query(txPallets.system, chainQuery.number)
  const auctionMinDuration = getMinAuctionDuration()
  const auctionStartBlock = Number.parseInt(currentBlock.toString()) + 10
  const auctionEndBlock = auctionStartBlock + auctionMinDuration
  await createAuction(
    nEvent.nftId,
    mEvent.marketplaceId,
    auctionStartBlock,
    auctionEndBlock,
    1,
    undefined,
    testAccount,
    WaitUntil.BlockInclusion,
  )
  TEST_DATA.nftId = nEvent.nftId
  TEST_DATA.marketplaceId = mEvent.marketplaceId
  TEST_DATA.startBlock = auctionStartBlock
  TEST_DATA.endBlock = auctionEndBlock
})

describe("Testing getting Auction data", (): void => {
  it("Should return null if an Invalid NFT ID is passed", async () => {
    const maybe_auction = await getAuctionData(1000000)
    expect(maybe_auction).toBeNull()
  })
  it("Should return the Auction Data when the NFT ID exists", async () => {
    const { test: testAccount } = await createTestPairs()
    const auction = await getAuctionData(TEST_DATA.nftId)
    const startPrice = (await numberToBalance(1)).toString()

    expect(
      auction?.creator === testAccount.address &&
        auction?.marketplaceId === TEST_DATA.marketplaceId &&
        auction?.startPrice.toString() === startPrice &&
        auction?.startPriceRounded === 1 &&
        auction?.buyItPrice === null &&
        auction?.buyItPriceRounded === null &&
        auction?.isExtended === false &&
        auction?.bidders.length === 0 &&
        auction?.startBlock === TEST_DATA.startBlock &&
        auction?.endBlock === TEST_DATA.endBlock,
    ).toBe(true)
  })
})

it("Should return the auction ending block", async () => {
  const endBlock = await getAuctionDeadline(TEST_DATA.nftId)
  expect(endBlock).toBe(TEST_DATA.endBlock)
})
