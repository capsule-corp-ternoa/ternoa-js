import { bnToBn } from "@polkadot/util"

import {
  ActiveFixedContractType,
  ActiveSubscribedContractType,
  AvailableRentalContractType,
  RentalContractChainRawDataType,
  RentalContractDataType,
} from "./types"

import { BalanceType, blockNumberToDate, query } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"
import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction } from "./enum"
import { roundBalance } from "../helpers/utils"

/**
 * @name getRentalContractData
 * @summary         Provides the data related to a rent contract.
 * @param nftId     The ID of the contracted NFT.
 * @returns         A JSON object with the rental contract data.
 */
export const getRentalContractData = async (nftId: number): Promise<RentalContractDataType | null> => {
  const data = await query(txPallets.rent, chainQuery.contracts, [nftId])
  if (data.isEmpty == true) {
    return null
  }
  try {
    const {
      hasStarted,
      startBlock,
      renter,
      rentee,
      duration,
      acceptanceType,
      revocationType,
      rentFee,
      termsAccepted,
      renterCancellationFee,
      renteeCancellationFee,
    } = data.toJSON() as RentalContractChainRawDataType

    const startBlockDate = startBlock && typeof startBlock === "number" && (await blockNumberToDate(startBlock))
    const durationType = duration.fixed
      ? DurationAction.Fixed
      : duration.subscription
      ? DurationAction.Subscription
      : DurationAction.Infinite

    const blockDuration =
      durationType === DurationAction.Fixed
        ? duration.fixed
        : durationType === DurationAction.Subscription
        ? duration.subscription[0]
        : null

    const blockSubscriptionRenewal =
      durationType === DurationAction.Subscription && duration.subscription[1] ? duration.subscription[1] : null

    const acceptance =
      acceptanceType.manualAcceptance === null || acceptanceType.manualAcceptance
        ? AcceptanceAction.ManualAcceptance
        : AcceptanceAction.AutoAcceptance

    const acceptanceList = acceptanceType.manualAcceptance
      ? acceptanceType.manualAcceptance
      : acceptanceType.autoAcceptance
      ? acceptanceType.autoAcceptance
      : []

    const rentFeeType = rentFee.tokens ? RentFeeAction.Tokens : RentFeeAction.NFT
    const rentFeeAmount = rentFee.tokens ? bnToBn(rentFee.tokens).toString() : Number(rentFee.nft)
    const rentFeeRounded = typeof rentFeeAmount === "string" ? roundBalance(rentFeeAmount) : rentFeeAmount

    const renterCancellationFeeType =
      renterCancellationFee &&
      (renterCancellationFee.fixedTokens
        ? CancellationFeeAction.FixedTokens
        : renterCancellationFee.flexibleTokens
        ? CancellationFeeAction.FlexibleTokens
        : CancellationFeeAction.NFT)

    const renterCancellationFeeAmount =
      renterCancellationFee &&
      (renterCancellationFeeType === CancellationFeeAction.FixedTokens
        ? bnToBn(renterCancellationFee.fixedTokens).toString()
        : renterCancellationFeeType === CancellationFeeAction.FlexibleTokens
        ? bnToBn(renterCancellationFee.flexibleTokens).toString()
        : Number(renterCancellationFee.nft))

    const renterCancellationFeeRounded =
      renterCancellationFee &&
      (typeof renterCancellationFeeAmount === "string"
        ? roundBalance(renterCancellationFeeAmount)
        : renterCancellationFeeAmount)

    const renteeCancellationFeeType =
      renteeCancellationFee &&
      (renteeCancellationFee.fixedTokens
        ? CancellationFeeAction.FixedTokens
        : renteeCancellationFee.flexibleTokens
        ? CancellationFeeAction.FlexibleTokens
        : CancellationFeeAction.NFT)

    const renteeCancellationFeeAmount =
      renteeCancellationFee &&
      (renteeCancellationFeeType === CancellationFeeAction.FixedTokens
        ? bnToBn(renteeCancellationFee.fixedTokens).toString()
        : renteeCancellationFeeType === CancellationFeeAction.FlexibleTokens
        ? bnToBn(renteeCancellationFee.flexibleTokens).toString()
        : Number(renteeCancellationFee.nft))

    const renteeCancellationFeeRounded =
      renteeCancellationFee &&
      (typeof renteeCancellationFeeAmount === "string"
        ? roundBalance(renteeCancellationFeeAmount)
        : renteeCancellationFeeAmount)

    return {
      hasStarted,
      startBlock,
      startBlockDate,
      renter,
      rentee,
      durationType,
      blockDuration,
      blockSubscriptionRenewal,
      acceptanceType: acceptance,
      acceptanceList,
      revocationType,
      rentFeeType,
      rentFee: rentFeeAmount,
      rentFeeRounded,
      renterCancellationFeeType,
      renterCancellationFee: renterCancellationFeeAmount,
      renterCancellationFeeRounded,
      renteeCancellationFeeType,
      renteeCancellationFee: renteeCancellationFeeAmount,
      renteeCancellationFeeRounded,
      termsAccepted,
    } as RentalContractDataType
  } catch (error) {
    throw new Error(`${Errors.RENT_NFT_CONVERSION_ERROR}`)
  }
}

/**
 * @name getRentalContractNumber
 * @summary       Provides the current number of rental contracts.
 * @returns       Number.
 */
export const getRentalContractNumber = async (): Promise<number> => {
  const data = await query(txPallets.rent, chainQuery.numberOfCurrentContracts)
  return (data as any as BalanceType).toNumber()
}

/**
 * @name getRentalOffers
 * @summary       Provides the data related to rent contracts offers.
 * @param nftId   The ID of the contracted NFT.
 * @returns       An Array of adresses (string).
 */
export const getRentalOffers = async (nftId: number): Promise<string[]> => {
  const data = await query(txPallets.rent, chainQuery.offers, [nftId])
  const result = data.toJSON() as string[]
  return result
}

/**
 * @name getAvailableRentalContracts
 * @summary       Provides the data related to available contracts deadlines.
 * @returns       An Array of object with the NFT ID, the block expriation ID, a date of expiration.
 */
export const getAvailableRentalContracts = async (): Promise<AvailableRentalContractType[]> => {
  const data = await query(txPallets.rent, chainQuery.availableQueue)
  if (data.isEmpty == true) {
    return []
  }
  try {
    const result = data.toJSON() as [number[]]
    const AvailableRentalContractList = await Promise.all(
      result.map(async (contract: number[]) => {
        const list = {} as AvailableRentalContractType
        list.nftId = contract[0]
        list.contractExpirationBlockId = contract[1]
        list.contractExpirationDate = await blockNumberToDate(contract[1])
        return list
      }),
    )
    return AvailableRentalContractList as AvailableRentalContractType[]
  } catch (error) {
    throw new Error(`${Errors.RENT_NFT_CONVERSION_ERROR}`)
  }
}

/**
 * @name getActiveFixedRentalContracts
 * @summary       Provides the data related to activated fixed contract deadlines.
 * @returns       An Array of object with the NFT ID, the block expriation ID, a date of expiration.
 */
export const getActiveFixedRentalContracts = async (): Promise<ActiveFixedContractType[]> => {
  const data = await query(txPallets.rent, chainQuery.fixedQueue)
  if (data.isEmpty == true) {
    return []
  }
  try {
    const result = data.toJSON() as [number[]]
    const ActiveFixedRentalContractList = await Promise.all(
      result.map(async (contract: number[]) => {
        const list = {} as ActiveFixedContractType
        list.nftId = contract[0]
        list.contractEndingBlockId = contract[1]
        list.contractEndingDate = await blockNumberToDate(contract[1])
        return list
      }),
    )
    return ActiveFixedRentalContractList as ActiveFixedContractType[]
  } catch (error) {
    throw new Error(`${Errors.RENT_NFT_CONVERSION_ERROR}`)
  }
}

/**
 * @name getActiveSubscribedRentalContracts
 * @summary       Provides the data related to activated subscribed contract deadlines.
 * @returns       An Array of object with the NFT ID, the block expriation ID, a date of expiration.
 */
export const getActiveSubscribedRentalContracts = async (): Promise<ActiveSubscribedContractType[]> => {
  const data = await query(txPallets.rent, chainQuery.subscriptionQueue)
  if (data.isEmpty == true) {
    return []
  }
  try {
    const result = data.toJSON() as [number[]]
    const ActiveSubscribedContractList = await Promise.all(
      result.map(async (contract: number[]) => {
        const list = {} as ActiveSubscribedContractType
        list.nftId = contract[0]
        list.contractRenewalOrEndBlockId = contract[1]
        list.contractRenewalOrEndDate = await blockNumberToDate(contract[1])
        return list
      }),
    )
    return ActiveSubscribedContractList as ActiveSubscribedContractType[]
  } catch (error) {
    throw new Error(`${Errors.RENT_NFT_CONVERSION_ERROR}`)
  }
}
