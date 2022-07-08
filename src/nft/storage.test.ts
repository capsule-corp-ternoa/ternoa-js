import { initializeApi } from "../blockchain"
import { getCollectionOffchainDataLimit } from "./constants";
import { getCollectionData, getNextCollectionId, getNextNftId, getNftData, getNftMintFee } from "./storage";
import { createTestPairs } from "../_misc/testingPairs";
import { createCollection, createNft } from "./extrinsics";
import { WaitUntil } from "../constants";

const TEST_DATA = {
  collectionId: 0,
  nftId: 0
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT;
  await initializeApi(endpoint);

  // Create some Test NFTs and Collections
  const { test: testAccount } = await createTestPairs();
  let cEvent = await createCollection("Collection Test", undefined, testAccount, WaitUntil.BlockInclusion);
  let nEvent = await createNft("Test NFT Data", 0, cEvent.collectionId, false, testAccount, WaitUntil.BlockInclusion);
  TEST_DATA.collectionId = cEvent.collectionId;
  TEST_DATA.nftId = nEvent.nftId;
});


it("NFT Mint Fee storage should exist and it should not be null", async () => {
  const actual = await getNftMintFee();
  expect(actual != undefined).toBe(true);
})

it("Next NFT ID storage should exist and it should not be null", async () => {
  const actual = await getNextNftId();
  expect(actual != undefined).toBe(true);
})

it("Next Collection ID storage should exist and it should not be null", async () => {
  const actual = await getNextCollectionId();
  expect(actual != undefined).toBe(true);
})

it("Testing collection offchain data size limit to be 150", async () => {
  const actual = await getCollectionOffchainDataLimit();
  const expected = 150;
  expect(actual).toEqual(expected);
})

describe("Testing getting NFT data", (): void => {
  it("Should return null if an Invalid NFT ID is passed", async () => {
    const maybe_nft = await getNftData(1000000);
    expect(maybe_nft).toBeNull();
  })
  it("Should return the NFT Data when the NFT ID exists", async () => {
    const maybe_nft = await getNftData(TEST_DATA.nftId);
    expect(maybe_nft != null).toBe(true)
  })
})

describe("Testing Collection NFT data", (): void => {
  it("Should return null if an Invalid Collection ID is passed", async () => {
    const maybe_collection = await getCollectionData(1000000);
    expect(maybe_collection).toBeNull();
  })
  it("Should return the NFT Data when the Collection ID exists", async () => {
    const maybe_collection = await getCollectionData(TEST_DATA.collectionId);
    expect(maybe_collection != null).toBe(true)
  })
})