import { isHex } from "@polkadot/util"
import { BN, isBN } from "bn.js"

import {
  batchTxHex,
  batchAllTxHex,
  consts,
  createTxHex,
  initializeApi,
  query,
  submitTxHex,
  balanceToNumber,
  numberToBalance,
  isValidSignature,
  getTxInitialFee,
  submitTxBlocking,
  checkFundsForTxFees,
  createTx,
  getTxAdditionalFee,
  getTxFees,
  signTxHex,
  forceBatchTxHex,
} from "."
import { generateSeed, getKeyringFromSeed } from "../account"
import { chainConstants, chainQuery, Errors, txActions, txPallets, WaitUntil } from "../constants"
import { BalancesTransferEvent, BalancesWithdrawEvent, ExtrinsicSuccessEvent } from "../events"
import { getNftMintFee } from "../nft"
import { createTestPairs } from "../_misc/testingPairs"

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  return initializeApi(endpoint)
})

it("createTxHex should return a correct transaction hash hex", async () => {
  const { test: testAccount } = await createTestPairs()
  const txHex = await createTxHex(txPallets.balances, txActions.transfer, [testAccount.address, "10000000000000000"])
  expect(isHex(txHex)).toBe(true)
})

it("signedTxHex should return a correct signable transaction hash hex", async () => {
  const { test: testAccount } = await createTestPairs()
  const txHex = await createTxHex(txPallets.balances, txActions.transfer, [testAccount.address, "10000000000000000"])
  const signedTxHex = await signTxHex(testAccount, txHex)
  expect(isHex(signedTxHex)).toBe(true)
})

it("submitTxHex should return a correct submited transaction hash hex", async () => {
  const { test: testAccount, dest: destAccount } = await createTestPairs()
  const txHex = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "1000000000000000"])
  const signedTxHex = await signTxHex(testAccount, txHex)
  const submittedTxHex = await submitTxHex(signedTxHex)
  expect(isHex(submittedTxHex)).toBe(true)
})

it("batchTxHex should return a correct batch transaction hash hex", async () => {
  const { dest: destAccount } = await createTestPairs()
  const txHex1 = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "1000000000000000"])
  const txHex2 = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "2000000000000000"])
  const batchTx = await batchTxHex([txHex1, txHex2])
  expect(isHex(batchTx)).toBe(true)
})

it("batchAllTxHex should return a correct batchAll transaction hash hex", async () => {
  const { dest: destAccount } = await createTestPairs()
  const txHex1 = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "1000000000000000"])
  const txHex2 = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "2000000000000000"])
  const batchAllTx = await batchAllTxHex([txHex1, txHex2])
  expect(isHex(batchAllTx)).toBe(true)
})

it("forceBatchTxHex should return a correct batch transaction hash hex", async () => {
  const { dest: destAccount } = await createTestPairs()
  const txHex1 = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "1000000000000000"])
  const txHex2 = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "2000000000000000"])
  const forceBatchTx = await forceBatchTxHex([txHex1, txHex2])
  expect(isHex(forceBatchTx)).toBe(true)
})

it("submitTxBlocking should contain BalancesTransfer and ExtrinsicSuccess events on a succesful balance transfer transaction", async () => {
  const { test: testAccount, dest: destAccount } = await createTestPairs()
  const txHex = await createTxHex(txPallets.balances, txActions.transfer, [destAccount.address, "1000000000000000"])
  const { events } = await submitTxBlocking(txHex, WaitUntil.BlockInclusion, testAccount)
  const isSuccess =
    Boolean(events.findEvent(BalancesWithdrawEvent)) &&
    Boolean(events.findEvent(BalancesTransferEvent)) &&
    Boolean(events.findEvent(ExtrinsicSuccessEvent))
  expect(isSuccess).toBe(true)
}, 60000)

describe("Constants", (): void => {
  it("Should get the correct existensial deposit", async (): Promise<void> => {
    const existensialDeposit = consts(txPallets.balances, chainConstants.existentialDeposit)
    expect(existensialDeposit).toBeDefined()
  })
  it("Should throw error with inexisting consts", async () => {
    await expect(async () => {
      consts("toBe", "orNotToBe")
    }).rejects.toThrow(TypeError)
  })
})

describe("Storage query", (): void => {
  it("Should be able to query storage data", async () => {
    const data = await query(txPallets.system, chainQuery.number)
    expect(data).toBeDefined()
  })
  it("Should throw error with inexisting storage", async () => {
    await expect(async () => {
      await query("toBe", "orNotToBe")
    }).rejects.toThrow(TypeError)
  })
})

describe("Fee getters", (): void => {
  it("Should get initial fee estimation for a transaction", async () => {
    const { test: testAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.nft, txActions.createNft, ["offchain data", 0, undefined, false])
    const txInitialFee = await getTxInitialFee(txHex, testAccount.address)
    expect(isBN(txInitialFee)).toBe(true)
  })

  it("Should get additional fee for NFT creation", async () => {
    const nftMintFee = await getNftMintFee()
    const txHex = await createTxHex(txPallets.nft, txActions.createNft, ["offchain data", 0, undefined, false])
    const txAdditionalFee = await getTxAdditionalFee(txHex)
    expect(txAdditionalFee.eq(nftMintFee)).toBe(true)
  })

  it("Should get zero additional fee for a default transaction (e.g. a balance transfer)", async () => {
    const { test: testAccount } = await createTestPairs()
    const txHex = await createTxHex(txPallets.balances, txActions.transfer, [testAccount.address, "10000000000000000"])
    const txAdditionalFee = await getTxAdditionalFee(txHex)
    expect(txAdditionalFee.isZero()).toBe(true)
  })

  it("Should get total fee estimation for a transaction", async () => {
    const { test: testAccount } = await createTestPairs()
    const nftMintFee = await getNftMintFee()
    const txHex = await createTxHex(txPallets.nft, txActions.createNft, ["offchain data", 0, undefined, false])
    const txFee = await getTxFees(txHex, testAccount.address)
    expect(txFee.gt(nftMintFee)).toBe(true)
  })

  xit("Should throw an error if insufficient funds for fees", async () => {
    const seed = generateSeed()
    const keyring = await getKeyringFromSeed(seed)
    const txHex = await createTx(txPallets.balances, txActions.transfer, [keyring.address, "10000000000000000000"])
    await expect(async () => {
      await checkFundsForTxFees(txHex)
    }).rejects.toThrow(Error(Errors.INSUFFICIENT_FUNDS))
  })
})

describe("Balance formatting", (): void => {
  it("Should format a BN into a number", async () => {
    const res = balanceToNumber(new BN("123432100000000000000000000"))
    expect(res).toBe("123.4321 MCAPS")
  })
  it("Should unformat a number into a BN", async () => {
    const res = numberToBalance(123.4321)
    expect(res).toEqual(new BN("123432100000000000000"))
  })
})

describe("isValidSignature", (): void => {
  it("Should return true if a message passed as parameter has been signed by the passed address", async () => {
    expect(
      isValidSignature(
        "This is a text message",
        "0x2aeaa98e26062cf65161c68c5cb7aa31ca050cb5bdd07abc80a475d2a2eebc7b7a9c9546fbdff971b29419ddd9982bf4148c81a49df550154e1674a6b58bac84",
        "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      ),
    ).toBe(true)
  })
  it("Should return false if a message passed as parameter has not been signed by the passed address", async () => {
    const { test: testAccount } = await createTestPairs()
    expect(
      isValidSignature(
        "This is a text message",
        "0x2aeaa98e26062cf65161c68c5cb7aa31ca050cb5bdd07abc80a475d2a2eebc7b7a9c9546fbdff971b29419ddd9982bf4148c81a49df550154e1674a6b58bac84",
        testAccount.address,
      ),
    ).toBe(false)
  })
})
