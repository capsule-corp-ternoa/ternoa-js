import BN from "bn.js"

import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction, RevocationAction } from "./enum"
import {
  acceptRentOffer,
  acceptSubscriptionTerms,
  changeSubscriptionTerms,
  createContract,
  rent,
  retractRentOffer,
  revokeContract,
} from "./extrinsics"

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
    const contractEvent = await createContract(
      TEST_DATA.nftId,
      {
        [DurationAction.Subscription]: [10],
      },
      {
        [AcceptanceAction.ManualAcceptance]: [destAccount.address],
      },
      RevocationAction.OnSubscriptionChange,
      { [RentFeeAction.Tokens]: new BN("1000000000000000000") },
      { [CancellationFeeAction.FixedTokens]: new BN("1000000000000000000") },
      null,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const rentFee = (await numberToBalance(1)).toString()
    const cancellationFee = (await numberToBalance(1)).toString()
    expect(
      contractEvent.nftId === TEST_DATA.nftId &&
        contractEvent.renter === testAccount.address &&
        contractEvent.durationType === DurationAction.Subscription &&
        contractEvent.blockDuration === 10 &&
        contractEvent.blockSubscriptionRenewal === null &&
        contractEvent.acceptanceType === AcceptanceAction.ManualAcceptance &&
        contractEvent.acceptanceList?.includes(destAccount.address) &&
        contractEvent.acceptanceList?.length === 1 &&
        contractEvent.revocationType === RevocationAction.OnSubscriptionChange &&
        contractEvent.rentFeeType === RentFeeAction.Tokens &&
        contractEvent.rentFee === rentFee &&
        contractEvent.rentFeeRounded === 1 &&
        contractEvent.renterCancellationFeeType === CancellationFeeAction.FixedTokens &&
        contractEvent.renterCancellationFee === cancellationFee &&
        contractEvent.renterCancellationFeeRounded === 1 &&
        contractEvent.renteeCancellationFeeType === undefined &&
        contractEvent.renteeCancellationFee === undefined &&
        contractEvent.renteeCancellationFeeRounded === undefined,
    ).toBe(true)
  })

  it("Should return the address who made the offer on an NFT contract", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { rentee, nftId } = await rent(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    expect(rentee === destAccount.address && nftId === TEST_DATA.nftId).toBe(true)
  })

  it("Should return the address who retracted the offer", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { rentee, nftId } = await retractRentOffer(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    expect(rentee === destAccount.address && nftId === TEST_DATA.nftId).toBe(true)
  })

  it("Should return the rentee address of the accepted offer when a contract started", async () => {
    const { dest: destAccount, test: testAccount } = await createTestPairs()
    await rent(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
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
      { [DurationAction.Subscription]: [15] },
      new BN("1000000000000000000"),
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const rentFee = (await numberToBalance(1)).toString()
    expect(
      contractEvent.nftId === TEST_DATA.nftId &&
        contractEvent.durationType === DurationAction.Subscription &&
        contractEvent.blockDuration === 15 &&
        contractEvent.blockSubscriptionRenewal === null &&
        contractEvent.rentFeeType === RentFeeAction.Tokens &&
        contractEvent.rentFee === rentFee &&
        contractEvent.rentFeeRounded === 1,
    ).toBe(true)
  })
  it("Should return the nftId of the new updated and accepted contract", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { nftId } = await acceptSubscriptionTerms(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    expect(nftId === TEST_DATA.nftId).toBe(true)
  })

  it("Should return the address of the revoker of the contract", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { nftId, revokedBy } = await revokeContract(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    expect(revokedBy === destAccount.address && nftId === TEST_DATA.nftId).toBe(true)
  })
})
