import { getMarketplaceMintFee } from "."

test("Should be able to query storage data", async () => {
  expect(await getMarketplaceMintFee()).toBeDefined()
})
