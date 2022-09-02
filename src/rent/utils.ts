import { numberToBalance } from "../blockchain"
/**
 * @name formatRentFee
 * @summary         Checks the type fee and format it accordingly. Numbers are formatted into BN when RentFeeType is a Token .
 * @param fee       The fee to format : It can only be an flexibleTokensFee or CancellationFeeType.
 * @returns         The formatted fee.
 */
export const formatRentContractFee = async (fee: any) => {
  //flexibleTokensFee || CancellationFeeType in stead of any in params
  if (typeof fee.tokens === "number") {
    const TokensFee = await numberToBalance(fee.token)
    fee.tokens = TokensFee
  }
  if (typeof fee.fixedTokens === "number") {
    const fixedTokensFee = await numberToBalance(fee.fixedTokens)
    fee.fixedTokens = fixedTokensFee
  }
  if (typeof fee.flexibleTokens === "number") {
    const flexibleTokensFee = await numberToBalance(fee.flexibleTokens)
    fee.flexibleTokens = flexibleTokensFee
  }
  return fee
}
