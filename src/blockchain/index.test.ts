import { hexToU8a, isHex } from "@polkadot/util"

import { consts, createTxHex, query, signTx } from "."
import { chainConstants, chainQuery, txActions, txPallets } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"

describe("Testing consts", (): void => {
  it("Should get the correct existensial deposit", async (): Promise<void> => {
    const existensialDeposit = await consts(txPallets.balances, chainConstants.existentialDeposit)
    expect(existensialDeposit).toBeDefined()
  })
  it("Should throw error with inexisting consts", async () => {
    await expect(async () => {
      await consts("toBe", "orNotToBe")
    }).rejects.toThrow(TypeError)
  })
})

describe("Testing query", (): void => {
  it("Should be able to query storage data", async () => {
    const data = await query(txPallets.nfts, chainQuery.nftMintFee)
    expect(data).toBeDefined()
  })
  it("Should throw error with inexisting storage", async () => {
    await expect(async () => {
      await query("toBe", "orNotToBe")
    }).rejects.toThrow(TypeError)
  })
})

describe("Testing create transaction", (): void => {
  it("Should return a correct transaction hex", async () => {
    const { test: testAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      testAccount.address,
      "10000000000000000000",
    ])
    expect(isHex(txHex)).toBe(true)
  })
  it("Should throw error with incorrect pallet/extrinsic", async () => {
    await expect(async () => {
      await createTxHex("toBe", "orNotToBe", [])
    }).rejects.toThrow(Error("toBe_orNotToBe not found, check the selected endpoint"))
  })
})

describe("Testing sign transaction", (): void => {
  it("Should return a correct signable transaction hex", async () => {
    const { test: testAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
      testAccount.address,
      "10000000000000000000",
    ])
    const signedTxHex = await signTx(testAccount, txHex)
    expect(isHex(signedTxHex)).toBe(true)
  })
  it("Should throw error with an invalid keyring", async () => {
    await expect(async () => {
      const { test: testAccount } = await createTestPairs()
      const txHex = await createTxHex(txPallets.balances, txActions.transfer, [
        testAccount.address,
        "10000000000000000000",
      ])
      await signTx({ address: "wrongKeyring", addressRaw: undefined, publicKey: undefined, sign: undefined }, txHex)
    }).rejects.toThrow(Error)
  })
})

// signTransaction with valid seed
// signTransaction with invalid seed

// submit a simple transaction with 1 caps

// run transaction with simple balance transfer 1 caps
// run invalid transaction with balance transfer 1 caps from empty account

// batch
// batchAll

// safeUnsub
