import { numberToBalance } from "../blockchain"
/**
 * @name formatRentFee
 * @summary         Checks the type fee and format it accordingly. Numbers are formatted into BN.
 * @param fee       The fee to format : It can only be a RentFeeType or CancellationFeeType.
 * @returns         The formatted fee.
 */
export const formatRentContractFee = async (fee: any) => {
  //RentFeeType | CancellationFeeType instead of any in params
  if (typeof fee === "object") {
    if (typeof fee.tokens === "number") {
      const tokensFee = numberToBalance(fee.tokens)
      fee.tokens = tokensFee
    }
    if (typeof fee.fixedTokens === "number") {
      const fixedTokensFee = numberToBalance(fee.fixedTokens)
      fee.fixedTokens = fixedTokensFee
    }
    if (typeof fee.flexibleTokens === "number") {
      const flexibleTokensFee = numberToBalance(fee.flexibleTokens)
      fee.flexibleTokens = flexibleTokensFee
    }
  }
  return fee
}
