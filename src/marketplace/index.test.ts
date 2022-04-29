import { isBN } from "bn.js"
import { isHex } from "@polkadot/util"
import {
  checkBalanceToCreateMarketplace,
  checkMarketplaceKind,
  compareDatas,
  createMarketplace,
  getAllMarketplacesDatas,
  getMarketplaceDatas,
  getMarketplaceMintFee,
  updateCommissionFee,
  updateOwner,
  updateType,
} from "."
import { generateSeed } from "../account"
import { createTestPairs } from "../_misc/testingPairs"

// Warning : Tests never ran yet
describe("Testing to create a new marketplace", (): void => {
  xit("Should throw an Error if funds are insufficient to create a marketplace", async (): Promise<void> => {
    const account = await generateSeed()
    await expect(checkBalanceToCreateMarketplace(account.address)).rejects.toThrow(
      Error("Insufficient funds to create a marketplace"),
    )
  })
  xit("Should retrun the fee as a BN to mint a marketplace", async () => {
    const marketplaceMintFee = await getMarketplaceMintFee()
    expect(isBN(marketplaceMintFee)).toBe(true)
  })
  xit("Should throw an Error if the kind is not set to 'Public' or 'Private'", async (): Promise<void> => {
    await expect(checkMarketplaceKind("notPrivatenotPublic")).rejects.toThrow(
      Error("The kind of your marketplace must be set to 'Public' or 'Private'"),
    )
  })
  xit("Should return a correct minted marketplace hash hex or message ", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const createNewMarketplace = await createMarketplace(
      testAccount.address,
      "Public",
      10,
      "Random Marketplace",
      "https://randommarketplace.com",
      "https://logorandommarketplace.com",
      testAccount,
    )
    expect(isHex(createNewMarketplace)).toBe(true)
  })
})

describe("Testing to get marketplace datas", (): void => {
  xit("Should return an object with datas from a specific marketplace", async (): Promise<void> => {
    const datas = await getMarketplaceDatas(1)
    //expect(datas[0].kind).toBe("Public" || "Private")
    const marketplaceDatas = datas && JSON.parse(JSON.stringify(datas))
    expect(marketplaceDatas.kind).toBe("Public" || "Private")
  })
  xit("Should return an array of objects with datas from all the existing marketplaces", async (): Promise<void> => {
    const datas = await getAllMarketplacesDatas()
    expect(datas[0][0].commission_fee).toBeDefined() // Pas sur de mon coup là..
  })
})

describe("Testing to update marketplace datas", (): void => {
  xit("Should throw an Error if the marketplace data is already equal to the new data value", async (): Promise<void> => {
    await expect(compareDatas(1, "commission_fee", 10, "commission fee")).rejects.toThrow(
      Error("The commission fee of your marketplace is already set to : 10"),
    )
  })
  xit("Should return the correct transaction hex when the marketplace commission fee is updated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const setNewCommissionFee = updateCommissionFee(1, 20, testAccount)
    expect(isHex(setNewCommissionFee)).toBe(true)
  })
  xit("Should return the correct transaction hex when a new owner is set", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const setNewOwner = updateOwner(1, testAccount.address, testAccount)
    expect(isHex(setNewOwner)).toBe(true)
  })
  xit("Should return the correct transaction hex when the marketplace kind is updated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const updateKind = updateType(1, "Public", testAccount)
    expect(isHex(updateKind)).toBe(true)
  })
  xit("Should return the correct transaction hex when the marketplace name is updated", async (): Promise<void> => {
    //updateName
  })
  xit("Should return the correct transaction hex when the marketplace uri is updated", async (): Promise<void> => {
    //updateUri
  })
  xit("Should return the correct transaction hex when the marketplace logoUri is updated", async (): Promise<void> => {
    //updateLogoUri
  })
})
