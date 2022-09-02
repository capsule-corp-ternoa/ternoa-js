import BN from "bn.js"

import { createContract, rent, revokeContract } from "./extrinsics"
import { AcceptanceAction, DurationAction, RentFeeAction, RevocationAction } from "./enum"
import {
  getActiveFixedRentalContracts,
  getActiveSubscribedRentalContracts,
  getAvailableRentalContracts,
  getRentalContractData,
  getRentalContractNumber,
  getRentalOffers,
} from "./storage"

import { initializeApi } from "../blockchain"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { createTestPairs } from "../_misc/testingPairs"

const TEST_DATA = {
  nftId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = "wss://dev-1.ternoa.network"
  await initializeApi(endpoint)

  // Create some Test NFT and a RentContract
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  TEST_DATA.nftId = nEvent.nftId
  await createContract(
    TEST_DATA.nftId,
    DurationAction.Infinite,
    {
      [AcceptanceAction.ManualAcceptance]: null,
    },
    RevocationAction.Anytime,
    { [RentFeeAction.Tokens]: new BN("1000000000000000000") },
    null,
    null,
    testAccount,
    WaitUntil.BlockInclusion,
  )
})

describe("Testing global contracts data", (): void => {
  it("Should return the number of rental contracts available", async () => {
    const numberOfContracts = await getRentalContractNumber()
    expect(numberOfContracts > 1).toBe(true)
  })
  it("Should return the id, blocknumber and date for an available contract", async () => {
    const data = await getAvailableRentalContracts()
    const today = new Date()
    expect(data[0].nftId > 0 && data[0].contractExpirationBlockId > 0 && data[0].contractExpirationDate > today).toBe(
      true,
    )
  })
})

it("Should return the address of the offer made on an NFT", async () => {
  const { dest: destAccount } = await createTestPairs()
  const { rentee } = await rent(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
  const offer = await getRentalOffers(TEST_DATA.nftId)
  expect(rentee === destAccount.address && offer[0] === rentee).toBe(true)
})

describe("Testing Rental Contract data", (): void => {
  it("Should return the Rent Contract Data when an NFT ID with a Rent contract exists", async () => {
    const maybe_Rent_Contract = await getRentalContractData(TEST_DATA.nftId)
    expect(maybe_Rent_Contract != null).toBe(true)
  })
  it("Should return null if an invalid Rental Contract ID (the nftID) is passed", async () => {
    const { test: testAccount } = await createTestPairs()
    await revokeContract(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)
    const maybe_Rent_Contract = await getRentalContractData(TEST_DATA.nftId)
    expect(maybe_Rent_Contract).toBeNull()
  })
})

describe("Testing Active Rental Contracts data", (): void => {
  it("Should return the id, blocknumber and date for an active fixed contract", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await createContract(
      TEST_DATA.nftId,
      { [DurationAction.Fixed]: 30 },
      {
        [AcceptanceAction.AutoAcceptance]: null,
      },
      RevocationAction.Anytime,
      { [RentFeeAction.Tokens]: new BN("1000000000000000000") },
      null,
      null,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    await rent(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const data = await getActiveFixedRentalContracts()
    const today = new Date()
    expect(data[0].nftId > 0 && data[0].contractEndingBlockId > 0 && data[0].contractEndingDate > today).toBe(true)
  })
  it("Should return the id, blocknumber and date for an active subscription contract", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await revokeContract(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    await createContract(
      TEST_DATA.nftId,
      { [DurationAction.Subscription]: [10, 20] },
      {
        [AcceptanceAction.AutoAcceptance]: null,
      },
      RevocationAction.Anytime,
      { [RentFeeAction.Tokens]: new BN("1000000000000000000") },
      null,
      null,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    await rent(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const data = await getActiveSubscribedRentalContracts()
    const today = new Date()
    expect(
      data[0].nftId > 0 && data[0].contractRenewalOrEndBlockId > 0 && data[0].contractRenewalOrEndDate > today,
    ).toBe(true)
  })
})
