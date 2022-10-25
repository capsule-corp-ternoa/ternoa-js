import BN from "bn.js"

import { acceptRentOffer, createContract, makeRentOffer, rent, revokeContract } from "./extrinsics"
import {
  AcceptanceAction,
  CancellationFeeAction,
  DurationAction,
  RentFeeAction,
  SubscriptionActionDetails,
} from "./enum"
import { getRentalContractData, getRentalOffers, getRentingQueues } from "./storage"

import { initializeApi, numberToBalance } from "../blockchain"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { createTestPairs } from "../_misc/testingPairs"

const TEST_DATA = {
  nftId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create some Test NFT and a RentContract
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("TEST_NFT_DATA", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  TEST_DATA.nftId = nEvent.nftId
  await createContract(
    TEST_DATA.nftId,
    {
      [DurationAction.Fixed]: 1000,
    },
    {
      [AcceptanceAction.ManualAcceptance]: null,
    },
    false,
    { [RentFeeAction.Tokens]: new BN("1000000000000000000") },
    { [CancellationFeeAction.FlexibleTokens]: 1 },
    CancellationFeeAction.None,
    testAccount,
    WaitUntil.BlockInclusion,
  )
})

describe("Testing contracts in queue and getting contract datas", (): void => {
  it("Should return the rent contract data when an NFT ID with a rent contract exists", async () => {
    const { test: testAccount } = await createTestPairs()
    const contract = await getRentalContractData(TEST_DATA.nftId)
    const rentFee = (await numberToBalance(1)).toString()
    const cancellationFee = (await numberToBalance(1)).toString()
    expect(
      contract?.startBlock == null &&
        contract?.startBlockDate == null &&
        contract?.renter == testAccount.address &&
        contract.rentee == null &&
        contract.duration[DurationAction.Fixed] == 1000 &&
        contract.acceptanceType === AcceptanceAction.ManualAcceptance &&
        contract.acceptanceList.length == 0 &&
        contract.rentFeeType === RentFeeAction.Tokens &&
        contract.rentFee === rentFee &&
        contract.rentFeeRounded === 1 &&
        contract.renterCanRevoke == false &&
        contract.renterCancellationFeeType === CancellationFeeAction.FlexibleTokens &&
        contract.renterCancellationFee === cancellationFee &&
        contract.renterCancellationFeeRounded === 1 &&
        contract.renteeCancellationFeeType === CancellationFeeAction.None &&
        contract.renteeCancellationFee === null &&
        contract.renteeCancellationFeeRounded === null,
    ).toBe(true)
  })

  it("Should return nftId and expriationBlockId of the first available queue", async () => {
    const { availableQueue } = await getRentingQueues()
    const filteredContract = availableQueue.filter((x) => x.nftId === TEST_DATA.nftId)
    expect(filteredContract[0].nftId >= TEST_DATA.nftId && filteredContract[0].expirationBlockId >= 0).toBe(true)
  })

  it("Should return the address of the offer made on an NFT", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { rentee } = await makeRentOffer(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const offer = await getRentalOffers(TEST_DATA.nftId)
    expect(rentee === destAccount.address && offer[0] === rentee).toBe(true)
  })

  it("Should return the nftId and endingBlockId of the first fixed queue running contract", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await acceptRentOffer(TEST_DATA.nftId, destAccount.address, testAccount, WaitUntil.BlockInclusion)
    const { fixedQueue } = await getRentingQueues()
    const filteredContract = fixedQueue.filter((x) => x.nftId === TEST_DATA.nftId)
    expect(filteredContract[0].nftId >= TEST_DATA.nftId && filteredContract[0].endingBlockId >= 0).toBe(true)
  })

  it("Should return null if an invalid rental contract ID (the nftID) is passed", async () => {
    const { dest: destAccount } = await createTestPairs()
    await revokeContract(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const maybeRentContract = await getRentalContractData(TEST_DATA.nftId)
    expect(maybeRentContract).toBeNull()
  })

  it("Should return the nftId and renewalOrEndBlockId of the first subscription queue running contract", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const { duration } = await createContract(
      TEST_DATA.nftId,
      {
        [DurationAction.Subscription]: {
          [SubscriptionActionDetails.PeriodLength]: 5,
          [SubscriptionActionDetails.MaxDuration]: 10,
          [SubscriptionActionDetails.IsChangeable]: false,
        },
      },
      {
        [AcceptanceAction.AutoAcceptance]: null,
      },
      false,
      { [RentFeeAction.Tokens]: new BN("1000000000000000000") },
      CancellationFeeAction.None,
      CancellationFeeAction.None,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    await rent(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const { subscriptionQueue } = await getRentingQueues()
    const filteredContract = subscriptionQueue.filter((x) => x.nftId === TEST_DATA.nftId)
    expect(
      filteredContract[0].nftId >= TEST_DATA.nftId &&
        filteredContract[0].renewalOrEndBlockId >= duration[DurationAction.Subscription].periodLength,
    ).toBe(true)
  })
})
