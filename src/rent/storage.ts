import { bnToBn } from "@polkadot/util"

import {
  RentalContractChainRawDataType,
  RentalContractDataType,
  RentingQueuesRawType,
  RentingQueuesType,
} from "./types"

import { blockNumberToDate, query } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"
import { AcceptanceAction, CancellationFeeAction, RentFeeAction } from "./enum"
import { roundBalance } from "../helpers/utils"

/**
 * @name getRentalContractData
 * @summary         Provides the data related to a rent contract.
 * @param nftId     The ID of the contracted NFT.
 * @returns         A JSON object with the rental contract data.
 */
export const getRentalContractData = async (nftId: number): Promise<RentalContractDataType | null> => {
  const data = await query(txPallets.rent, chainQuery.contracts, [nftId])
  if (data.isEmpty) {
    return null
  }
  try {
    const {
      creationBlock,
      startBlock,
      renter,
      rentee,
      duration,
      acceptanceType,
      renterCanRevoke,
      rentFee,
      renterCancellationFee,
      renteeCancellationFee,
    } = data.toJSON() as RentalContractChainRawDataType

    const creationBlockDate = await blockNumberToDate(creationBlock)
    const startBlockDate = startBlock !== null ? await blockNumberToDate(startBlock) : null
    const isManualAcceptance = AcceptanceAction.ManualAcceptance in acceptanceType
    const acceptance = isManualAcceptance ? AcceptanceAction.ManualAcceptance : AcceptanceAction.AutoAcceptance
    const acceptanceList = acceptanceType.manualAcceptance ?? acceptanceType.autoAcceptance ?? []
    const isRentFeeToken = RentFeeAction.Tokens in rentFee
    const rentFeeType = isRentFeeToken ? RentFeeAction.Tokens : RentFeeAction.NFT
    const rentFeeValue = isRentFeeToken ? bnToBn(rentFee.tokens).toString() : Number(rentFee.nft)
    const rentFeeValueRounded = typeof rentFeeValue === "number" ? rentFeeValue : roundBalance(rentFeeValue)

    let renterCancellationFeeType, renterCancellationFeeValue, renterCancellationFeeValueRounded
    switch (true) {
      case CancellationFeeAction.FixedTokens in renterCancellationFee:
        renterCancellationFeeType = CancellationFeeAction.FixedTokens
        renterCancellationFeeValue = bnToBn(renterCancellationFee[renterCancellationFeeType]).toString()
        renterCancellationFeeValueRounded = roundBalance(renterCancellationFeeValue)
        break
      case CancellationFeeAction.FlexibleTokens in renterCancellationFee:
        renterCancellationFeeType = CancellationFeeAction.FlexibleTokens
        renterCancellationFeeValue = bnToBn(renterCancellationFee[renterCancellationFeeType]).toString()
        renterCancellationFeeValueRounded = roundBalance(renterCancellationFeeValue)
        break
      case CancellationFeeAction.NFT in renterCancellationFee:
        renterCancellationFeeType = CancellationFeeAction.NFT
        renterCancellationFeeValue = Number(renterCancellationFee[renterCancellationFeeType])
        renterCancellationFeeValueRounded = renterCancellationFeeValue
        break
      default:
        renterCancellationFeeType = CancellationFeeAction.None
        renterCancellationFeeValue = null
        renterCancellationFeeValueRounded = null
        break
    }

    let renteeCancellationFeeType, renteeCancellationFeeValue, renteeCancellationFeeValueRounded
    switch (true) {
      case CancellationFeeAction.FixedTokens in renteeCancellationFee:
        renteeCancellationFeeType = CancellationFeeAction.FixedTokens
        renteeCancellationFeeValue = bnToBn(renteeCancellationFee[renteeCancellationFeeType]).toString()
        renteeCancellationFeeValueRounded = roundBalance(renteeCancellationFeeValue)
        break
      case CancellationFeeAction.FlexibleTokens in renteeCancellationFee:
        renteeCancellationFeeType = CancellationFeeAction.FlexibleTokens
        renteeCancellationFeeValue = bnToBn(renteeCancellationFee[renteeCancellationFeeType]).toString()
        renteeCancellationFeeValueRounded = roundBalance(renteeCancellationFeeValue)
        break
      case CancellationFeeAction.NFT in renteeCancellationFee:
        renteeCancellationFeeType = CancellationFeeAction.NFT
        renteeCancellationFeeValue = Number(renteeCancellationFee[renteeCancellationFeeType])
        renteeCancellationFeeValueRounded = renteeCancellationFeeValue
        break
      default:
        renteeCancellationFeeType = CancellationFeeAction.None
        renteeCancellationFeeValue = null
        renteeCancellationFeeValueRounded = null
        break
    }

    return {
      creationBlock,
      creationBlockDate,
      startBlock,
      startBlockDate,
      renter,
      rentee,
      duration,
      acceptanceType: acceptance,
      acceptanceList,
      renterCanRevoke,
      rentFeeType,
      rentFee: rentFeeValue,
      rentFeeRounded: rentFeeValueRounded,
      renterCancellationFeeType,
      renterCancellationFee: renterCancellationFeeValue,
      renterCancellationFeeRounded: renterCancellationFeeValueRounded,
      renteeCancellationFeeType,
      renteeCancellationFee: renteeCancellationFeeValue,
      renteeCancellationFeeRounded: renteeCancellationFeeValueRounded,
    } as RentalContractDataType
  } catch (error) {
    throw new Error(`${Errors.RENT_NFT_CONVERSION_ERROR}`)
  }
}

/**
 * @name getRentalOffers
 * @summary       Provides the data related to rent contracts offers.
 * @param nftId   The ID of the contracted NFT.
 * @returns       An Array of adresse(s) (string) or null if no offer are available.
 */
export const getRentalOffers = async (nftId: number): Promise<string[]> => {
  const data = await query(txPallets.rent, chainQuery.offers, [nftId])
  const result = data.toJSON() as string[]
  return result
}

/**
 * @name getRentingQueues
 * @summary       Provides the deadlines related to contracts in queues for available contracts, running fixed contract and running subscribed contract.
 * @returns       An object containing an array with NFT ID, the block expriation ID for each fixedQueue, subscriptionQueue or availableQueue. See the RentingQueuesType type.
 */
export const getRentingQueues = async (): Promise<RentingQueuesType> => {
  const data = await query(txPallets.rent, chainQuery.queues)
  try {
    const { fixedQueue, subscriptionQueue, availableQueue } = data.toJSON() as RentingQueuesRawType

    return {
      fixedQueue: fixedQueue.map((queue) => ({
        nftId: queue[0],
        endingBlockId: queue[1],
      })),
      subscriptionQueue: subscriptionQueue.map((queue) => ({
        nftId: queue[0],
        renewalOrEndBlockId: queue[1],
      })),
      availableQueue: availableQueue.map((queue) => ({
        nftId: queue[0],
        expirationBlockId: queue[1],
      })),
    } as RentingQueuesType
  } catch (error) {
    throw new Error(`${Errors.RENT_NFT_CONVERSION_ERROR}`)
  }
}
