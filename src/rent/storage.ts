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

    const startBlockDate = startBlock && typeof startBlock === "number" && (await blockNumberToDate(startBlock))

    const acceptance =
      acceptanceType.manualAcceptance === null || acceptanceType.manualAcceptance
        ? AcceptanceAction.ManualAcceptance
        : AcceptanceAction.AutoAcceptance

    const acceptanceList = acceptanceType.manualAcceptance
      ? acceptanceType.manualAcceptance
      : acceptanceType.autoAcceptance
      ? acceptanceType.autoAcceptance
      : []

    const rentFeeType = rentFee.tokens >= 0 ? RentFeeAction.Tokens : RentFeeAction.NFT
    const rentFeeAmount = rentFee.tokens >= 0 ? bnToBn(rentFee.tokens).toString() : Number(rentFee.nft)
    const rentFeeRounded = typeof rentFeeAmount === "number" ? rentFeeAmount : roundBalance(rentFeeAmount)

    const renterCancellationFeeType =
      renterCancellationFee &&
      (renterCancellationFee.fixedTokens
        ? CancellationFeeAction.FixedTokens
        : renterCancellationFee.flexibleTokens
        ? CancellationFeeAction.FlexibleTokens
        : renterCancellationFee.nft
        ? CancellationFeeAction.NFT
        : CancellationFeeAction.None)

    const renterCancellationFeeAmount =
      renterCancellationFee &&
      (renterCancellationFeeType === CancellationFeeAction.FixedTokens
        ? bnToBn(renterCancellationFee.fixedTokens).toString()
        : renterCancellationFeeType === CancellationFeeAction.FlexibleTokens
        ? bnToBn(renterCancellationFee.flexibleTokens).toString()
        : renterCancellationFeeType === CancellationFeeAction.NFT
        ? Number(renterCancellationFee.nft)
        : null)

    const renterCancellationFeeRounded =
      renterCancellationFee &&
      (typeof renterCancellationFeeAmount === "number"
        ? renterCancellationFeeAmount
        : renterCancellationFeeAmount === null
        ? null
        : roundBalance(renterCancellationFeeAmount))

    const renteeCancellationFeeType =
      renteeCancellationFee &&
      (renteeCancellationFee.fixedTokens
        ? CancellationFeeAction.FixedTokens
        : renteeCancellationFee.flexibleTokens
        ? CancellationFeeAction.FlexibleTokens
        : renteeCancellationFee.nft
        ? CancellationFeeAction.NFT
        : CancellationFeeAction.None)

    const renteeCancellationFeeAmount =
      renteeCancellationFee &&
      (renteeCancellationFeeType === CancellationFeeAction.FixedTokens
        ? bnToBn(renteeCancellationFee.fixedTokens).toString()
        : renteeCancellationFeeType === CancellationFeeAction.FlexibleTokens
        ? bnToBn(renteeCancellationFee.flexibleTokens).toString()
        : renteeCancellationFeeType === CancellationFeeAction.NFT
        ? Number(renteeCancellationFee.nft)
        : null)

    const renteeCancellationFeeRounded =
      renteeCancellationFee &&
      (typeof renteeCancellationFeeAmount === "number"
        ? renteeCancellationFeeAmount
        : renteeCancellationFeeAmount === null
        ? null
        : roundBalance(renteeCancellationFeeAmount))

    return {
      startBlock,
      startBlockDate,
      renter,
      rentee,
      duration,
      acceptanceType: acceptance,
      acceptanceList,
      renterCanRevoke,
      rentFeeType,
      rentFee: rentFeeAmount,
      rentFeeRounded,
      renterCancellationFeeType,
      renterCancellationFee: renterCancellationFeeAmount,
      renterCancellationFeeRounded,
      renteeCancellationFeeType,
      renteeCancellationFee: renteeCancellationFeeAmount,
      renteeCancellationFeeRounded,
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
      fixedQueue: fixedQueue.map((queue) => {
        return {
          nftId: queue[0],
          endingBlockId: queue[1],
        }
      }),
      subscriptionQueue: subscriptionQueue.map((queue) => {
        return {
          nftId: queue[0],
          renewalOrEndBlockId: queue[1],
        }
      }),
      availableQueue: availableQueue.map((queue) => {
        return {
          nftId: queue[0],
          expirationBlockId: queue[1],
        }
      }),
    } as RentingQueuesType
  } catch (error) {
    throw new Error(`${Errors.RENT_NFT_CONVERSION_ERROR}`)
  }
}
