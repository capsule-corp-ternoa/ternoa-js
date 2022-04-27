import BN, { isBN } from "bn.js"
import { isHex } from "@polkadot/util"
import { checkBalanceToCreateMarketplace, createMarketplace, getMarketplaceMintFee, updateCommissionFee } from "."
import { generateSeed } from "../account"
import { createTestPairs } from "../_misc/testingPairs"

// Warning : Tests never ran yet
describe("Testing marketplace creation", (): void => {
  describe("Testing account balance and marketplace fees to mint marketplace", (): void => {
    xit("Insufficient funds should throw an Error: 'Insufficient funds to create a marketplace", async (): Promise<void> => {
      const account = await generateSeed()
      await expect(checkBalanceToCreateMarketplace(account.address)).rejects.toThrow(
        Error("Insufficient funds to create a marketplace"),
      )
    })
    xit("Should retrun the fee as a BN to mint a marketplace", async () => {
      const marketplaceMintFee = await getMarketplaceMintFee()
      expect(isBN(marketplaceMintFee)).toBe(true)
    })
  })

  xit("Should return a correct minted marketplace hash hex or message ", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const createNewMarketplace = await createMarketplace(
      testAccount.address,
      "Public",
      new BN("100000000000000000000"),
      "Random Marketplace",
      "https://randommarketplace.com",
      "https://logorandommarketplace.com",
      testAccount,
    )
    expect(isHex(createNewMarketplace)).toBe(true)
  })
})

describe("Testing updates marketplace datas", (): void => {
  xit("Should return the correct transaction hex after commission fee is updated", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const updateFee = updateCommissionFee(1, 10, testAccount)
    expect(isHex(updateFee)).toBe(true)
  })
})
