import { isBN } from "bn.js"
import { getTxGasFee } from "."
import { generateSeed, getKeyringFromSeed } from "../account"
import { createTxHex, signTx, submitTx } from "../blockchain"
import { txActions, txPallets } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"

describe("Checking funds to pay transaction gas fees on tx submit", (): void => {
  it("Should throw an error if insufficient funds for gas or treasury", async () => {
    const account = await generateSeed()
    const keyring = await getKeyringFromSeed(account.seed)
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [keyring.address, "10000000000000000000"])
    const signedTxHex = await signTx(keyring, txHex)
    await expect(async () => {
      await submitTx(signedTxHex)
    }).rejects.toThrow(Error("Insufficient funds for gas or treasury"))
  })
})

describe("Testing fees getters", (): void => {
  it("Should get the gas fee estimation for a transaction", async () => {
    const { test: testAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      testAccount.address,
      "1000000000000000000",
    ])
    const txGasFee = await getTxGasFee(txHex, testAccount.address)
    expect(isBN(txGasFee)).toBe(true)
  })
})
