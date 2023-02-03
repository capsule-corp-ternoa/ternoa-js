import { CommissionFeeType, ListingFeeType } from "./types"

import { formatPermill } from "../helpers/utils"
import { numberToBalance } from "../blockchain"

/**
 * @name formatMarketplaceFee
 * @summary         Checks the type fee and format it accordingly. Numbers are formatted into BN. Percentages are formatted in Permill.
 * @param fee       The fee to format : It can only be an CommissionFeeType or ListingFeeType.
 * @returns         The formatted fee.
 */
export const formatMarketplaceFee = async (fee: CommissionFeeType | ListingFeeType) => {
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
