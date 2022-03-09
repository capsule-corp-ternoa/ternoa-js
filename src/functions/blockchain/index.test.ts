import { getQuery } from "."

describe("Generic blockchain functions tests", () => {
  test("Should be able to query storage data", async () => {
    const data = await getQuery("nfts", "nftMintFee")
    expect(data).toBeDefined()
  })
  test("Should throw error with inexisting storage", async () => {
    await expect(async () => {
      await getQuery("toBe", "orNotToBe")
    }).rejects.toThrow(TypeError)
  })
})
