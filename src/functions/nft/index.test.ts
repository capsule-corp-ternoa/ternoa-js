import { getNftMintFee } from "."

test("Should be able to query storage data", async () => {
  expect(await getNftMintFee()).toBeDefined()
})
