import { getCapsuleMintFee } from "."

test("Should be able to query storage data", async () => {
  expect(await getCapsuleMintFee()).toBeDefined()
})
