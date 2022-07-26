// import { Errors } from "../constants"
import { formatPermill } from "./utils"

describe("Testing formatPermill", (): void => {
  it("Should format royalty from a percent number to a permill", () => {
    const permillRoyalty = formatPermill(10)
    expect(permillRoyalty === 100000).toBe(true)
  })
  // it("Should throw an error if royalty is not in range 0-100", async () => {
  //   await expect(() => {
  //     formatPermill(200)
  //   }).rejects.toThrow(Error(Errors.ROYALTY_MUST_BE_PERCENTAGE))
  // })
})
