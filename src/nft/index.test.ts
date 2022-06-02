import { isBN } from "bn.js"
import { isHex } from "@polkadot/util"
import { burnNft, checkBalanceToMintNft, createNft, delegateNft, getNftMintFee, transferNft } from "."
import { generateSeed } from "../account"
import { createTestPairs } from "../_misc/testingPairs"

// Warning : Tests never ran yet
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
    const createNewNft = await createNft(testAccount.address, "IPFSLink", 10, false, undefined, testAccount)
    expect(isHex(createNewNft)).toBe(true)
  })
})

describe("Testing to update/remove an Nft", (): void => {
  // Which NFT to do testings with ?
  xit("Should return a correct hash hex when Nft is burned/deleted", async (): Promise<void> => {
    const remove = await burnNft(1)
    expect(isHex(remove)).toBe(true)
  })
  xit("Should return a correct hash hex when Nft is transfered to another account", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    const transfer = await transferNft(1, destAccount.address)
    expect(isHex(transfer)).toBe(true)
  })
  xit("Should return a correct hash hex when Nft is delegated to another account", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    const delegate = await delegateNft(1, destAccount.address)
    expect(isHex(delegate)).toBe(true)
  })
})
