import { numberToBalance } from "../blockchain"
import { Errors } from "../constants"

import {
  AcceptanceAction,
  CancellationFeeAction,
  DurationAction,
  RentFeeAction,
  SubscriptionActionDetails,
} from "./enum"
import { AcceptanceType, CancellationFeeType, DurationType, RentFeeType } from "./types"

/**
 * @name formatDuration
 * @summary Returns an object representing a duration in either fixed or subscription format.
 *
 * @param type - The type of duration. Can be either 'fixed' or 'subscription'.
 * @param duration - The length of the contract duration in blocks.
 * @param maxDuration - (Optional) The maximum length of the contract subscription duration in blocks. Only applicable for subscriptions.
 * @param isChangeable - (Optional) A boolean indicating if the duration can be changed. Only applicable for subscriptions.
 *
 * @returns An object representing the duration of a contract.
 */
export const formatDuration = (
  type: "fixed" | "subscription",
  duration: number,
  maxDuration?: number,
  isChangeable = false,
): DurationType =>
  type === "fixed"
    ? {
        [DurationAction.Fixed]: duration,
      }
    : {
        [DurationAction.Subscription]: {
          [SubscriptionActionDetails.PeriodLength]: duration,
          [SubscriptionActionDetails.MaxDuration]: maxDuration ?? null,
          [SubscriptionActionDetails.IsChangeable]: isChangeable,
        },
      }

/**
 * @name formatAcceptanceType
 * @summary Returns an object representing an acceptance type in either auto or manual format.
 *
 * @param type - The type of acceptance. Can be either 'auto' or 'manual'.
 * @param list - (Optional) A list of addresses. Only applicable for auto acceptance.
 *
 * @returns An object representing the acceptance type of a contract.
 */
export const formatAcceptanceType = (type: "auto" | "manual", list?: string[] | null): AcceptanceType =>
  type === "auto"
    ? {
        [AcceptanceAction.AutoAcceptance]: list ?? null,
      }
    : {
        [AcceptanceAction.ManualAcceptance]: list ?? null,
      }

/**
 * @name formatRentFee
 * @summary Returns an object representing a rent fee in either tokens or NFT format.
 *
 * @param type - The type of rent fee. Can be either 'tokens' or 'nft'.
 * @param value - The value of the rent fee. If type is 'tokens' value refers to a balance amount. If type is 'nft' value refers to the NFT id.
 *
 * @returns An object representing the rent fee of a contract.
 */
export const formatRentFee = (type: "tokens" | "nft", value: number): RentFeeType =>
  type === "tokens"
    ? {
        [RentFeeAction.Tokens]: numberToBalance(value),
      }
    : {
        [RentFeeAction.NFT]: value,
      }

/**
 * @name formatCancellationFee
 * @summary Returns an object representing a cancellation fee in either fixed, flexible or NFT format.
 *
  type: "fixed" | "flexible" | "nft" | "none",
 * @param type - The type of cancellation fee. Can be either 'fixed', 'flexible', 'nft' or 'none'.
 * @param value - The value of the rent fee. If type is 'fixed' or 'flexible' value refers to a balance amount. If type is 'nft' value refers to the NFT id.
 *
 * @returns An object representing the rent fee of a contract.
 */
export const formatCancellationFee = (
  type: "fixed" | "flexible" | "nft" | "none",
  value?: number,
): CancellationFeeType => {
  if (type === "none") return CancellationFeeAction.None
  if (value === undefined) throw new Error(`${Errors.VALUE_MUST_BE_DEFINED}`)
  switch (type) {
    case "fixed":
      return {
        [CancellationFeeAction.FixedTokens]: numberToBalance(value),
      }
    case "flexible":
      return {
        [CancellationFeeAction.FlexibleTokens]: numberToBalance(value),
      }
    case "nft":
      return {
        [CancellationFeeAction.NFT]: value,
      }
    default:
      return CancellationFeeAction.None
  }
}
