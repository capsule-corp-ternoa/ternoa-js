import { AccountListType, CollectionListType, CommissionFeeType, ListingFeeType, OffchainDataType } from "./types"

import { formatPermill } from "../helpers/utils"
import { numberToBalance } from "../blockchain"
import { Errors } from "../constants"
import { MarketplaceConfigAction, MarketplaceConfigFeeType } from "./enum"

/**
 * @name convertMarketplaceFee
 * @summary         Checks the type fee and format it accordingly. Numbers are formatted into BN. Percentages are formatted in Permill.
 * @param fee       The fee to format : It can only be an CommissionFeeType or ListingFeeType.
 * @returns         The formatted fee.
 */
export const convertMarketplaceFee = async (fee: CommissionFeeType | ListingFeeType) => {
  if (typeof fee === "object") {
    if (typeof fee.set.flat === "number") {
      const flatFee = numberToBalance(fee.set.flat)
      fee.set.flat = flatFee
    }
    if (fee.set.percentage) {
      const percentageFee = formatPermill(fee.set.percentage)
      fee.set.percentage = percentageFee
    }
  }
  return fee
}

/**
 * @name formatMarketplaceFee
 * @summary Returns an object representing either the marketplace commission or listing fee in either in Flat or Percentage format.
 *
 * @param action - The type of Action. Can be either "Noop" (No Operation: to keep it as it is), "Remove" or "set".
 * @param feeType - The type of fee. Can be either "percentage" or "flat",
 * @param value - The value of the fee. If type is 'Percentage' value refers to a decimal number in range [0, 100]. If type is 'Flat' value refers to a balance amount in a number. Default is 0.
 *
 * @returns An object representing either the marketplace commission or listing fee.
 */
export const formatMarketplaceFee = (
  action: "Noop" | "Remove" | "set",
  feeType?: "percentage" | "flat",
  value?: number,
): CommissionFeeType => {
  if (action !== "Noop" && action !== "Remove" && action !== "set")
    throw new Error("INCORRECT_ACTION: action has to be either 'Noop', 'Remove', 'set'.")
  if (feeType && feeType !== "percentage" && feeType !== "flat")
    throw new Error("INCORRECT_FEE_TYPE: feeType has to be either 'percentage' or 'flat'.")
  switch (action) {
    case "Noop":
      return MarketplaceConfigAction.Noop
    case "Remove":
      return MarketplaceConfigAction.Remove
    case "set": {
      if (value === undefined || feeType === undefined) throw new Error(`${Errors.VALUE_MUST_BE_DEFINED}`)
      if (feeType && feeType === "percentage") {
        return {
          [MarketplaceConfigAction.Set]: { [MarketplaceConfigFeeType.Percentage]: formatPermill(value) },
        }
      } else {
        return {
          [MarketplaceConfigAction.Set]: { [MarketplaceConfigFeeType.Flat]: numberToBalance(value) },
        }
      }
    }
    default:
      return MarketplaceConfigAction.Noop
  }
}

/**
 * @name formatMarketplaceAccountList
 * @summary Returns an object representing a list of accounts : if the marketplace kind is private, it allows these accounts to sell NFT. If the marketplace kind is public, it bans these accounts from selling NFT.
 *
 * @param action - The type of Action. Can be either "Noop" (No Operation: to keep it as it is), "Remove" or "set".
 * @param value - An array of addresses (string) to add to the list.
 *
 * @returns An object representing either the whitelisted or banned accounts.
 */
export const formatMarketplaceAccountList = (action: "Noop" | "Remove" | "set", value?: string[]): AccountListType => {
  if (action !== "Noop" && action !== "Remove" && action !== "set")
    throw new Error("INCORRECT_ACTION: action has to be either 'Noop', 'Remove', 'set'.")
  switch (action) {
    case "Noop":
      return MarketplaceConfigAction.Noop
    case "Remove":
      return MarketplaceConfigAction.Remove
    case "set": {
      if (value === undefined) throw new Error(`${Errors.VALUE_MUST_BE_DEFINED}`)
      return {
        [MarketplaceConfigAction.Set]: value,
      }
    }
    default:
      return MarketplaceConfigAction.Noop
  }
}

/**
 * @name formatMarketplaceOffchainData
 * @summary Returns the off-chain related marketplace metadata. Can be an IPFS Hash, an URL or plain text.
 *
 * @param action - The type of Action. Can be either "Noop" (No Operation: to keep it as it is), "Remove" or "set".
 * @param value - The marketplkace offchain metadata : a string
 *
 * @returns An object representing either the marketplace offchain metadata.
 */
export const formatMarketplaceOffchainData = (action: "Noop" | "Remove" | "set", value?: string): OffchainDataType => {
  if (action !== "Noop" && action !== "Remove" && action !== "set")
    throw new Error("INCORRECT_ACTION: action has to be either 'Noop', 'Remove', 'set'.")
  switch (action) {
    case "Noop":
      return MarketplaceConfigAction.Noop
    case "Remove":
      return MarketplaceConfigAction.Remove
    case "set": {
      if (value === undefined) throw new Error(`${Errors.VALUE_MUST_BE_DEFINED}`)
      return {
        [MarketplaceConfigAction.Set]: value,
      }
    }
    default:
      return MarketplaceConfigAction.Noop
  }
}

/**
 * @name formatMarketplaceCollectionList
 * @summary Returns an object representing a list of collection of NFT : if the marketplace kind is private, it allows these collection to be listed. If the marketplace kind is public, it bans these collection of NFT from listing.
 *
 * @param action - The type of Action. Can be either "Noop" (No Operation: to keep it as it is), "Remove" or "set".
 * @param value - An array of Collection id (number) to add to the list.
 *
 * @returns An object representing either the whitelisted or banned collection Id.
 */
export const formatMarketplaceCollectionList = (
  action: "Noop" | "Remove" | "set",
  value?: number[],
): CollectionListType => {
  if (action !== "Noop" && action !== "Remove" && action !== "set")
    throw new Error("INCORRECT_ACTION: action has to be either 'Noop', 'Remove', 'set'.")
  switch (action) {
    case "Noop":
      return MarketplaceConfigAction.Noop
    case "Remove":
      return MarketplaceConfigAction.Remove
    case "set": {
      if (value === undefined) throw new Error(`${Errors.VALUE_MUST_BE_DEFINED}`)
      return {
        [MarketplaceConfigAction.Set]: value,
      }
    }
    default:
      return MarketplaceConfigAction.Noop
  }
}
