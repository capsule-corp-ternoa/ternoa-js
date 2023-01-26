import { initializeApi } from "../blockchain"
import { getCollectionOffchainDataLimit } from "./constants"
import {
  getCapsuleMintFee,
  getCapsuleOffchainData,
  getCollectionData,
  getNextCollectionId,
  getNextNftId,
  getNftData,
  getNftMintFee,
  getSecretNftMintFee,
  getSecretNftOffchainData,
} from "./storage"
import { createTestPairs } from "../_misc/testingPairs"
import { createCollection, createNft, createSecretNft } from "./extrinsics"
import { WaitUntil } from "../constants"

const TEST_DATA = {
  collectionId: 0,
  nftId: 0,
  secretNftId: 0,
  capsuleNftId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create some Test NFTs and Collections
  const { test: testAccount } = await createTestPairs()
  const cEvent = await createCollection("Collection Test", undefined, testAccount, WaitUntil.BlockInclusion)
  const nEvent = await createNft("Test NFT Data", 0, cEvent.collectionId, false, testAccount, WaitUntil.BlockInclusion)
  const secretNft = await createSecretNft(
    "Test NFT Data",
    "Test Secret NFT Data",
    0,
    undefined,
    false,
    testAccount,
    WaitUntil.BlockInclusion,
  )
  // const capsuleNft = await createCapsule(
  //   "Test NFT offchainData",
  //   "Test Capsule NFT offchainData",
  //   0,
  //   undefined,
  //   false,
  //   testAccount,
  //   WaitUntil.BlockInclusion,
  //)

  TEST_DATA.collectionId = cEvent.collectionId
  TEST_DATA.nftId = nEvent.nftId
  TEST_DATA.secretNftId = secretNft.nftId
  //TEST_DATA.capsuleNftId = capsuleNft.nftId
})

it("NFT Mint Fee storage should exist and it should not be null", async () => {
  const actual = await getNftMintFee()
  expect(actual != undefined).toBe(true)
})

it("Secret NFT Mint Fee storage should exist and it should not be null", async () => {
  const actual = await getSecretNftMintFee()
  expect(actual != undefined).toBe(true)
})

it("Capsule NFT Mint Fee storage should exist and it should not be null", async () => {
  const actual = await getCapsuleMintFee()
  expect(actual != undefined).toBe(true)
})

it("Next NFT ID storage should exist and it should not be null", async () => {
  const actual = await getNextNftId()
  expect(actual != undefined).toBe(true)
})

it("Next Collection ID storage should exist and it should not be null", async () => {
  const actual = await getNextCollectionId()
  expect(actual != undefined).toBe(true)
})

it("Testing collection offchain data size limit to be 150", async () => {
  const actual = await getCollectionOffchainDataLimit()
  const expected = 150
  expect(actual).toEqual(expected)
})

describe("Testing getting NFT data", (): void => {
  it("Should return null if an Invalid NFT ID is passed", async () => {
    const maybeNft = await getNftData(1000000)
    expect(maybeNft).toBeNull()
  })
  it("Should return the NFT Data when the NFT ID exists", async () => {
    const maybeNft = await getNftData(TEST_DATA.nftId)
    expect(maybeNft != null).toBe(true)
  })
  it("Should return secret offchain data when the NFT ID exists and is a Secret NFT", async () => {
    const actual = await getSecretNftOffchainData(TEST_DATA.secretNftId)
    expect(actual != undefined).toBe(true)
  })
  it("Should return the capsule offchain data when the NFT ID exists and is a Capsule NFT", async () => {
    const actual = await getCapsuleOffchainData(TEST_DATA.secretNftId)
    expect(actual != undefined).toBe(true)
  })
})

describe("Testing Collection NFT data", (): void => {
  it("Should return null if an Invalid Collection ID is passed", async () => {
    const maybeCollection = await getCollectionData(1000000)
    expect(maybeCollection).toBeNull()
  })
  it("Should return the NFT Data when the Collection ID exists", async () => {
    const maybeCollection = await getCollectionData(TEST_DATA.collectionId)
    expect(maybeCollection != null).toBe(true)
  })
})
