import { initializeApi } from "../blockchain"
import { getCollectionOffchainDataLimit } from "./constants";
import { getNextCollectionId, getNextNftId, getNftData, getNftMintFee } from "./storage";
import { TEST_DATA } from "../_misc/testingPairs";

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT;
  await initializeApi(endpoint);
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
    console.log(TEST_DATA);
    const maybe_nft = await getNftData(TEST_DATA.nftId);
    expect(maybe_nft != null).toBe(true)
  })
})