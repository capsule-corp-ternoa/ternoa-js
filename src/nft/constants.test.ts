import { BN } from "bn.js"
import { initializeApi } from "../blockchain"
import { getCollectionOffchainDataLimit, getCollectionSizeLimit, getInitialMintFee, getNftOffchainDataLimit } from "./constants";

beforeAll(() => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT;
  return initializeApi(endpoint);
});


it("Testing initial mint fee to be 10 CAPS", async () => {
  const actual = await getInitialMintFee();
  const expected = new BN("10000000000000000000");
  expect(actual.eq(expected)).toBe(true);
})

it("Testing collection size limit to be 1 million", async () => {
  const actual = await getCollectionSizeLimit();
  const expected = 1000000;
  expect(actual).toEqual(expected);
})

it("Testing NFT offchain data size limit to be 150", async () => {
  const actual = await getNftOffchainDataLimit();
  const expected = 150;
  expect(actual).toEqual(expected);
})

it("Testing collection offchain data size limit to be 150", async () => {
  const actual = await getCollectionOffchainDataLimit();
  const expected = 150;
  expect(actual).toEqual(expected);
})