import { acceptRentOffer, createContract, makeRentOffer, rent, revokeContract } from "./extrinsics"
import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction } from "./enum"
import { getRentalContractData, getRentalOffers, getRentingQueues } from "./storage"
import { formatAcceptanceType, formatCancellationFee, formatDuration, formatRentFee } from "./utils"

import { initializeApi, numberToBalance } from "../blockchain"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { createTestPairs } from "../_misc/testingPairs"

const TEST_DATA = {
  nftId: 0,
  contractCreationBlockId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create some Test NFT and a RentContract
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("TEST_NFT_DATA", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  TEST_DATA.nftId = nEvent.nftId
  const duration = formatDuration("fixed", 1000)
  const acceptanceType = formatAcceptanceType("manual")
  const rentFee = formatRentFee("tokens", 1)
  const renterCancellationFee = formatCancellationFee("flexible", 1)
  const renteeCancellationFee = formatCancellationFee("none")
  const contractEvent = await createContract(
    TEST_DATA.nftId,
    duration,
    acceptanceType,
    false,
    rentFee,
    renterCancellationFee,
    renteeCancellationFee,
    testAccount,
    WaitUntil.BlockInclusion,
  )
  TEST_DATA.contractCreationBlockId = contractEvent.creationBlockId
})

describe("Testing contracts in queue and getting contract data", (): void => {
  it("Should return the rent contract data when an NFT ID with a rent contract exists", async () => {
    const { test: testAccount } = await createTestPairs()
    const contract = await getRentalContractData(TEST_DATA.nftId)
    const rentFee = numberToBalance(1).toString()
    const cancellationFee = numberToBalance(1).toString()

    expect(
      contract?.creationBlock == TEST_DATA.contractCreationBlockId &&
      contract?.startBlock == null &&
      contract?.startBlockDate == null &&
      contract?.renter == testAccount.address &&
      contract.rentee == null &&
      DurationAction.Fixed in contract.duration &&
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

  it("Should return nftId and expirationBlockId of the first available queue", async () => {
    const { availableQueue } = await getRentingQueues()
    const filteredContract = availableQueue.filter((x) => x.nftId === TEST_DATA.nftId)
    expect(filteredContract[0].nftId >= TEST_DATA.nftId && filteredContract[0].expirationBlockId >= 0).toBe(true)
  })

  it("Should return the address of the offer made on an NFT", async () => {
    const { dest: destAccount } = await createTestPairs()
    const { rentee } = await makeRentOffer(
      TEST_DATA.nftId,
      TEST_DATA.contractCreationBlockId,
      destAccount,
      WaitUntil.BlockInclusion,
    )
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
    const duration = formatDuration("subscription", 5, 10)
    const acceptanceType = formatAcceptanceType("auto")
    const rentFee = formatRentFee("tokens", 1)
    const renterCancellationFee = formatCancellationFee("none")
    const renteeCancellationFee = formatCancellationFee("none")
    const contract = await createContract(
      TEST_DATA.nftId,
      duration,
      acceptanceType,
      false,
      rentFee,
      renterCancellationFee,
      renteeCancellationFee,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    await rent(TEST_DATA.nftId, contract.creationBlockId, destAccount, WaitUntil.BlockInclusion)
    const { subscriptionQueue } = await getRentingQueues()
    const filteredContract = subscriptionQueue.filter((x) => x.nftId === TEST_DATA.nftId)
    const periodLength =
      DurationAction.Subscription in contract.duration && contract.duration[DurationAction.Subscription].periodLength
    expect(
      filteredContract[0].nftId >= TEST_DATA.nftId &&
      periodLength &&
      filteredContract[0].renewalOrEndBlockId >= periodLength,
    ).toBe(true)
  })
})
