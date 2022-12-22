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
): DurationType => {
  if (type !== "fixed" && type !== "subscription")
    throw new Error("INCORRECT_TYPE: type has to be either 'fixed' or 'subscription'.")
  if (typeof duration !== "number") throw new Error("MUST_BE_A_NUMBER: duration must be a number.")

  return type === "fixed"
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
export const formatAcceptanceType = (type: "auto" | "manual", list?: string[] | null): AcceptanceType => {
  if (type !== "auto" && type !== "manual") throw new Error("INCORRECT_TYPE: type has to be either 'auto' or 'manual'.")

  return type === "auto"
    ? {
        [AcceptanceAction.AutoAcceptance]: list ?? null,
      }
    : {
        [AcceptanceAction.ManualAcceptance]: list ?? null,
      }
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
export const formatRentFee = (type: "tokens" | "nft", value: number): RentFeeType => {
  if (type !== "tokens" && type !== "nft") throw new Error("INCORRECT_TYPE: type has to be either 'tokens' or 'nft'.")
  if (typeof value !== "number") throw new Error("MUST_BE_A_NUMBER: value must be a number.")

  return type === "tokens"
    ? {
        [RentFeeAction.Tokens]: value,
      }
    : {
        [RentFeeAction.NFT]: value,
      }
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
  if (type !== "fixed" && type !== "flexible" && type !== "nft" && type !== "none")
    throw new Error("INCORRECT_TYPE: type has to be either 'fixed', 'flexible', 'nft' or 'none'.")

  if (type === "none") return CancellationFeeAction.None
  if (value === undefined) throw new Error(`${Errors.VALUE_MUST_BE_DEFINED}`)
  switch (type) {
    case "fixed":
      return {
        [CancellationFeeAction.FixedTokens]: value,
      }
    case "flexible":
      return {
        [CancellationFeeAction.FlexibleTokens]: value,
      }
    case "nft":
      return {
        [CancellationFeeAction.NFT]: value,
      }
    default:
      return CancellationFeeAction.None
  }
}

/**
 * @name validateTransformContractFee
 * @summary         Validates the type fee and format it accordingly. Numbers are formatted into BN.
 * @param fee       The fee to format : It can only be a RentFeeType or CancellationFeeType.
 * @returns         The formatted fee.
 */
export const validateTransformContractFee = <T extends RentFeeType | CancellationFeeType>(
  fee: T,
): RentFeeType | CancellationFeeType => {
  if (typeof fee === "object") {
    if ("tokens" in fee && typeof fee.tokens === "number") {
      const tokensFee = numberToBalance(fee.tokens)
      fee.tokens = tokensFee
    }
    if ("fixedTokens" in fee && typeof fee.fixedTokens === "number") {
      const tokensFee = numberToBalance(fee.fixedTokens)
      fee.fixedTokens = tokensFee
    }
    if ("flexibleTokens" in fee && typeof fee.flexibleTokens === "number") {
      const tokensFee = numberToBalance(fee.flexibleTokens)
      fee.flexibleTokens = tokensFee
    }
  }
  return fee
}
