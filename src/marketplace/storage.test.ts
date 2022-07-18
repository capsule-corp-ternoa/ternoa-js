import { initializeApi } from "../blockchain"
import { getMarketplaceMintFee, getNextMarketplaceId, getMarketplaceData, getNftForSale } from "./storage"

beforeAll(() => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  return initializeApi(endpoint)
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
    const maybe_collection = await getMarketplaceData(1000000)
    expect(maybe_collection).toBeNull()
  })
  //   it("Should return the NFT Data when the Marketplace ID exists", async () => {
  //     // const maybe_collection = await getMarketplaceData("what id to pass ??")
  //     // expect(maybe_collection != null).toBe(true)
  //   })
})

describe("Testing NFT for sale data", (): void => {
  it("Should return null if an invalid NFT ID is passed", async () => {
    const maybe_collection = await getNftForSale(1000000)
    expect(maybe_collection).toBeNull()
  })
  //   it("Should return the NFT Data when the Marketplace ID exists", async () => {
  //     // const maybe_collection = await getNftForSale("what id to pass ??")
  //     // expect(maybe_collection != null).toBe(true)
  //   })
})
