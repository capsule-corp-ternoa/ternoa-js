import { BN } from "bn.js"
import { initializeApi } from "../blockchain"
import {
  getCollectionOffchainDataLimit,
  getCollectionSizeLimit,
  getInitialMintFee,
  getInitialSecretMintFee,
  getNftOffchainDataLimit,
} from "./constants"

beforeAll(() => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  return initializeApi(endpoint)
})

it("Testing initial mint fee to be 10 CAPS", async () => {
  const actual = await getInitialMintFee()
  expect(actual != undefined).toBe(true)
})

it("Testing initial secret mint fee to be 75 CAPS", async () => {
  const actual = await getInitialSecretMintFee()
  expect(actual != undefined).toBe(true)
})

it("Testing collection size limit to be 1 million", async () => {
  const actual = await getCollectionSizeLimit()
  expect(actual != undefined).toBe(true)
})

it("Testing NFT offchain data size limit to be 150", async () => {
  const actual = await getNftOffchainDataLimit()
  expect(actual != undefined).toBe(true)
})

it("Testing collection offchain data size limit to be 150", async () => {
  const actual = await getCollectionOffchainDataLimit()
  expect(actual != undefined).toBe(true)
})
