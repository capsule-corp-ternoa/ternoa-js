import { getQuery } from "."
import { chainQuery, txPallets } from "../../constants"

test("Should be able to query storage data", async () => {
  const data = await getQuery(txPallets.nfts, chainQuery.nftMintFee)
  expect(data).toBeDefined()
})
test("Should throw error with inexisting storage", async () => {
  await expect(async () => {
    await getQuery("toBe", "orNotToBe")
  }).rejects.toThrow(TypeError)
})

// create transaction with correct pallet / extrinsic
// create transaction with wrong pallet / extrinsic

// create signable transaction with correct tx and valid address
// create signable transaction with correct tx and invalid address

// signTransaction with valid seed
// signTransaction with invalid seed

// getTransactionFeesEstimate should return fees for simple transaction (eg:; balance transfer)
// getTransactionTreasury fee should return fees for valid transaction (create / createNFT)
// getTransactionTreasury fee should return 0 for transaction different than create / createFromNft

// submit a simple transaction with 1 caps

// run transaction with simple balance transfer 1 caps
// run invalid transaction with balance transfer 1 caps from empty account
