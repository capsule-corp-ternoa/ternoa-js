import { queryChain } from '.'
import { safeDisconnect } from '../../utils/blockchain'

describe('Generic blockchain functions tests', () => {
    test("Should be able to query storage data", async () => {
        const data = await queryChain("nfts", "nftMintFee")
        expect(data).toBeDefined()
        await safeDisconnect();
    })
    // test("Should throw error with inexisting storage", async () => {
    //     await expect(async () => {
    //         await queryChain("toBe", "orNotToBe")
    //     })
    //     .rejects
    //     .toThrow(TypeError)
    //     console.log("a")
    // })
    // afterAll(async () => {
    //     await safeDisconnect();
    // });
})