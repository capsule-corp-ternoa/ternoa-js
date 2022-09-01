import { initializeApi } from "../blockchain"
import {
  getAuctionEndingPeriod,
  getAuctionGracePeriod,
  getBidderListLengthLimit,
  getMaxAuctionDelay,
  getMinAuctionDuration,
  getMaxAuctionDuration,
  getParallelAuctionLimit,
} from "./constants"

beforeAll(() => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  return initializeApi(endpoint)
})

it("Testing to get the auction ending period constant", async () => {
  const endingPeriod = getAuctionEndingPeriod()
  expect(endingPeriod).toBeDefined()
})

it("Testing to get the auction grace period constant", async () => {
  const gracePeriod = getAuctionGracePeriod()
  expect(gracePeriod).toBeDefined()
})

it("Testing to get the bidder list lenggth limit constant", async () => {
  const limit = getBidderListLengthLimit()
  expect(limit).toBeDefined()
})

it("Testing to get the auction maximum delay constant", async () => {
  const delay = getMaxAuctionDelay()
  expect(delay).toBeDefined()
})

it("Testing to get the auction minimum duration constant", async () => {
  const duration = getMinAuctionDuration()
  expect(duration).toBeDefined()
})

it("Testing to get the auction maximum duration constant", async () => {
  const duration = getMaxAuctionDuration()
  expect(duration).toBeDefined()
})

it("Testing to get the parallel auction limit constant", async () => {
  const limit = getParallelAuctionLimit()
  expect(limit).toBeDefined()
})
