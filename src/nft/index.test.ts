import { isHex } from "@polkadot/util"
import { isBN } from "bn.js"
import {
  addNftToCollection,
  burnCollection,
  burnNft,
  checkBalanceToMintNft,
  closeCollection,
  compareData,
  createCollection,
  createNft,
  delegateNft,
  formatRoyalty,
  getCollectionData,
  getNftData,
  getNftMintFee,
  limitCollection,
  setRoyalty,
  transferNft,
} from "."
import { generateSeed } from "../account"
import { isValidAddress } from "../blockchain"
import { createTestPairs } from "../_misc/testingPairs"

describe("Testing to mint/create a new NFT", (): void => {
  it("Should retrun the fee as a BN to mint an NFT", async () => {
    const nftMintFee = await getNftMintFee()
    expect(isBN(nftMintFee)).toBe(true)
  })
  it("Should throw an Error if funds are insufficient to mint an NFT", async (): Promise<void> => {
    const account = await generateSeed()
    await expect(checkBalanceToMintNft(account.address)).rejects.toThrow(Error("Insufficient funds to mint an NFT"))
  })
  xit("Should return a correct minted NFT hash hex", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const createNewNft = await createNft("My First NFT", 10, null, false, testAccount)
    expect(isHex(createNewNft)).toBe(true)
  })
})

describe("Testing to get nft(s) or collection(s) data", (): void => {
  xit("Should return the data of a specific nft", async (): Promise<void> => {
    const data = await getNftData(0)
    expect(isValidAddress(data.owner)).toBe(true)
  })
  xit("Should return the data of a specific collection", async (): Promise<void> => {
    const data = await getCollectionData(0)
    expect(isValidAddress(data.owner)).toBe(true)
  })
})

describe("Testing to update/remove an NFT", (): void => {
  xit("Should throw an Error if the NFT data is already equal to the new data value", async (): Promise<void> => {
    const { royalty } = await getNftData(56)
    const formatedRoyalty = await formatRoyalty(10)
    await expect(compareData(royalty, "royalty", formatedRoyalty)).rejects.toThrow(
      Error(`The royalty is already set to : ${formatedRoyalty}`),
    )
  })
  xit("Should return a correct hash hex when NFT is delegated to another account", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const delegate = await delegateNft(56, destAccount.address, testAccount)
    expect(isHex(delegate)).toBe(true)
  })
  xit("Should return a correct hash hex when NFT is undelegated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const undelegate = await delegateNft(56, null, testAccount)
    expect(isHex(undelegate)).toBe(true)
  })
  xit("Should return a correct hash hex when the royalty is updated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const updatedRoyalty = await setRoyalty(3, 11, testAccount)
    expect(isHex(updatedRoyalty)).toBe(true)
  })
  xit("Should return a correct hash hex when NFT is transfered to another account", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const transfer = await transferNft(3, destAccount.address, testAccount)
    expect(isHex(transfer)).toBe(true)
  })
  xit("Should return a correct hash hex when NFT is burned/deleted", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const remove = await burnNft(2, testAccount)
    expect(isHex(remove)).toBe(true)
  })
})
describe("Testing to create/update a collection", (): void => {
  xit("Should return a correct hash hex when collection is created", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const createNewCollection = await createCollection("Offchain data", null, testAccount)
    expect(isHex(createNewCollection)).toBe(true)
  })
  xit("Should return a correct hash hex when an NFT is added to a collection", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const addNft = await addNftToCollection(1, 1, testAccount)
    expect(isHex(addNft)).toBe(true)
  })
  xit("Should return a correct hash hex when the collection limit is set or updated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const limitNFTCollection = await limitCollection(1, 100, testAccount)
    expect(isHex(limitNFTCollection)).toBe(true)
  })
  xit("Should return a correct hash hex when the collection is closed", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const closeNFTCollection = await closeCollection(1, testAccount)
    expect(isHex(closeNFTCollection)).toBe(true)
  })
  xit("Should return a correct hash hex when the collection is burned", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const burnNFTCollection = await burnCollection(1, testAccount)
    expect(isHex(burnNFTCollection)).toBe(true)
  })
})
