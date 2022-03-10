import { getQuery } from "."

test("Should be able to query storage data", async () => {
  const data = await getQuery("nfts", "nftMintFee")
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

// submit a simple transaction with 1 caps
