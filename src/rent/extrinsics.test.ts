import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction } from "./enum"
import {
  acceptRentOffer,
  acceptSubscriptionTerms,
  cancelContract,
  changeSubscriptionTerms,
  createContract,
  makeRentOffer,
  rent,
  retractRentOffer,
  revokeContract,
} from "./extrinsics"
import { formatAcceptanceType, formatCancellationFee, formatDuration, formatRentFee } from "./utils"

import { initializeApi, numberToBalance } from "../blockchain"
import { createNft } from "../nft"
import { WaitUntil } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"

const TEST_DATA = {
  nftId: 0,
}
beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)
  // Create some Test NFT
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  TEST_DATA.nftId = nEvent.nftId
})

describe("Testing Rent extrinsics", (): void => {
  it("Testing to create a rent contract", async (): Promise<void> => {
    const { dest: destAccount, test: testAccount } = await createTestPairs()
    const duration = formatDuration("subscription", 30, 100, true)
    const acceptanceType = formatAcceptanceType("manual", [destAccount.address])
    const rentFee = formatRentFee("tokens", 1)
    const renterCancellationFee = formatCancellationFee("fixed", 1)
    const renteeCancellationFee = formatCancellationFee("none")
    const contractEvent = await createContract(
      TEST_DATA.nftId,
      duration,
      acceptanceType,
      true,
      rentFee,
      renterCancellationFee,
      renteeCancellationFee,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    expect(
      contractEvent.nftId === TEST_DATA.nftId &&
        contractEvent.renter === testAccount.address &&
        contractEvent.duration[DurationAction.Subscription].periodLength === 30 &&
        contractEvent.duration[DurationAction.Subscription].maxDuration === 100 &&
        contractEvent.duration[DurationAction.Subscription].isChangeable === true &&
        contractEvent.duration[DurationAction.Subscription].newTerms === false &&
        contractEvent.acceptanceType === AcceptanceAction.ManualAcceptance &&
        contractEvent.acceptanceList?.includes(destAccount.address) &&
        contractEvent.acceptanceList?.length === 1 &&
        contractEvent.renterCanRevoke === true &&
        contractEvent.rentFeeType === RentFeeAction.Tokens &&
        contractEvent.rentFee === numberToBalance(1).toString() &&
        contractEvent.rentFeeRounded === 1 &&
        contractEvent.renterCancellationFeeType === CancellationFeeAction.FixedTokens &&
        contractEvent.renterCancellationFee === numberToBalance(1).toString() &&
        contractEvent.renterCancellationFeeRounded === 1 &&
        contractEvent.renteeCancellationFeeType === CancellationFeeAction.None &&
        contractEvent.renteeCancellationFee === null &&
        contractEvent.renteeCancellationFeeRounded === null,
    ).toBe(true)
  })

  it("Should return the address who made the offer on an NFT contract", async () => {
    const { dest: destAccount } = await createTestPairs()
    //TODO: improve signed_block_id
    const { rentee, nftId } = await makeRentOffer(TEST_DATA.nftId, 0, destAccount, WaitUntil.BlockInclusion)
    expect(rentee === destAccount.address && nftId === TEST_DATA.nftId).toBe(true)
  })

  it("Should return the address who retracted the offer", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { rentee, nftId } = await retractRentOffer(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    expect(rentee === destAccount.address && nftId === TEST_DATA.nftId).toBe(true)
  })

  it("Should return the rentee address of the accepted offer when a contract started", async () => {
    const { dest: destAccount, test: testAccount } = await createTestPairs()
    //TODO: improve signed_block_id
    await makeRentOffer(TEST_DATA.nftId, 0, destAccount, WaitUntil.BlockInclusion)
    const { rentee, nftId } = await acceptRentOffer(
      TEST_DATA.nftId,
      destAccount.address,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    expect(rentee === destAccount.address && nftId === TEST_DATA.nftId).toBe(true)
  })
})

describe("Testing to update and revoke a subscription contract", (): void => {
  it("Should return the updated terms of the contract", async () => {
    const { test: testAccount } = await createTestPairs()
    const contractEvent = await changeSubscriptionTerms(
      TEST_DATA.nftId,
      3,
      10,
      100,
      true,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const rentFee = numberToBalance(3).toString()
    expect(
      contractEvent.nftId === TEST_DATA.nftId &&
        contractEvent.period === 10 &&
        contractEvent.maxDuration === 100 &&
        contractEvent.isChangeable === true &&
        contractEvent.rentFeeType === RentFeeAction.Tokens &&
        contractEvent.rentFee === rentFee &&
        contractEvent.rentFeeRounded === 3,
    ).toBe(true)
  })
  it("Should return the nftId of the new updated and accepted contract", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { nftId } = await acceptSubscriptionTerms(
      TEST_DATA.nftId,
      3,
      10,
      100,
      true,
      destAccount,
      WaitUntil.BlockInclusion,
    )
    expect(nftId === TEST_DATA.nftId).toBe(true)
  })

  it("Should return the address of the revoker of the contract", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { nftId, revokedBy } = await revokeContract(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    expect(revokedBy === destAccount.address && nftId === TEST_DATA.nftId).toBe(true)
  })
})

describe("Testing to rent or cancel a contract", (): void => {
  it("Should return the nftId of the rented contract", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const duration = formatDuration("subscription", 5, 10)
    const acceptanceType = formatAcceptanceType("auto")
    const rentFee = formatRentFee("tokens", 1)
    const renterCancellationFee = formatCancellationFee("none")
    const renteeCancellationFee = formatCancellationFee("none")
    await createContract(
      TEST_DATA.nftId,
      duration,
      acceptanceType,
      true,
      rentFee,
      renterCancellationFee,
      renteeCancellationFee,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    //TODO: improve signed_block_id
    const { nftId } = await rent(TEST_DATA.nftId, 0, destAccount, WaitUntil.BlockInclusion)
    expect(nftId === TEST_DATA.nftId).toBe(true)
  })
  it("Should return the nftId of the cancelled contract", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await revokeContract(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const duration = formatDuration("fixed", 1000)
    const acceptanceType = formatAcceptanceType("auto")
    const rentFee = formatRentFee("tokens", 1)
    const renterCancellationFee = formatCancellationFee("none")
    const renteeCancellationFee = formatCancellationFee("none")
    await createContract(
      TEST_DATA.nftId,
      duration,
      acceptanceType,
      true,
      rentFee,
      renterCancellationFee,
      renteeCancellationFee,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const { nftId } = await cancelContract(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)
    expect(nftId === TEST_DATA.nftId).toBe(true)
  })
})
