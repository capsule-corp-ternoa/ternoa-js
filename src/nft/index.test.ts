import { isHex } from "@polkadot/util"
import { isBN } from "bn.js"
import {
  addNftToCollection,
  burnCollection,
  burnNft,
  checkBalanceToMintNft,
  closeCollection,
  compareDatas,
  createCollection,
  createNft,
  delegateNft,
  formatRoyalty,
  getCollectionDatas,
  getNftDatas,
  getNftMintFee,
  limitCollection,
  setNftMintFee,
  setRoyalty,
  transferNft,
} from "."
import { generateSeed } from "../account"
import { isValidAddress } from "../blockchain"
import { createTestPairs } from "../_misc/testingPairs"

describe("Testing to mint/create a new Nft", (): void => {
  xit("Should retrun the fee as a BN to mint an Nft", async () => {
    const nftMintFee = await getNftMintFee()
    expect(isBN(nftMintFee)).toBe(true)
  })
  xit("Should throw an Error if funds are insufficient to mint an Nft", async (): Promise<void> => {
    const account = await generateSeed()
    await expect(checkBalanceToMintNft(account.address)).rejects.toThrow(Error("Insufficient funds to mint an Nft"))
  })
  xit("Should return a correct minted Nft hash hex", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const createNewNft = await createNft(testAccount.address, "IPFSLink", 10, undefined, false, testAccount)
    expect(isHex(createNewNft)).toBe(true)
  })
})

describe("Testing to get nft(s) or collection(s) datas", (): void => {
  xit("Should return the datas of a specific nft", async (): Promise<void> => {
    const datas = await getNftDatas(0)
    expect(isValidAddress(datas.owner)).toBe(true)
  })
  xit("Should return the datas of a specific collection", async (): Promise<void> => {
    const datas = await getCollectionDatas(0)
    expect(isValidAddress(datas.owner)).toBe(true)
  })
})

describe("Testing to update/remove an Nft", (): void => {
  xit("Should throw an Error if the Nft data is already equal to the new data value", async (): Promise<void> => {
    const { royalty } = await getNftDatas(0)
    const formatedRoyalty = await formatRoyalty(100)
    await expect(compareDatas(royalty, "royalty", formatedRoyalty)).rejects.toThrow(
      Error(`The royalty of the NFT is already set to : ${formatedRoyalty}`),
    )
  })
  xit("Should return a correct hash hex when Nft is delegated to another account", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const delegate = await delegateNft(3, testAccount, destAccount.address)
    expect(isHex(delegate)).toBe(true)
  })
  xit("Should return a correct hash hex when Nft is undelegated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const undelegate = await delegateNft(3, testAccount)
    expect(isHex(undelegate)).toBe(true)
  })
  xit("Should return a correct hash hex when the royalty is updated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const updatedRoyalty = await setRoyalty(3, testAccount, 11)
    expect(isHex(updatedRoyalty)).toBe(true)
  })
  xit("Should return a correct hash hex when Nft is transfered to another account", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const transfer = await transferNft(3, testAccount, destAccount.address)
    expect(isHex(transfer)).toBe(true)
  })
  xit("Should return a correct hash hex when Nft is burned/deleted", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const remove = await burnNft(2, testAccount)
    expect(isHex(remove)).toBe(true) // should be deleted with dest ??
  })
  //tests below never ran yet
  xit("Should return a correct hash hex when the fee to mint an Nft is updated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const updatedNftMintFee = await setNftMintFee(20, testAccount)
    expect(isHex(updatedNftMintFee)).toBe(true)
  })
})
//tests below never ran yet
describe("Testing to create/update a collection", (): void => {
  xit("Should return a correct hash hex when collection is created", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const createNewCollection = await createCollection("Offchain datas", 50, testAccount)
    expect(isHex(createNewCollection)).toBe(true)
  })
  xit("Should return a correct hash hex when an Nft is added to a collection", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const addNft = await addNftToCollection(1, testAccount, 1)
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
