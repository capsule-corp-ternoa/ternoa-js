import { Errors } from "../constants"

/**
 * @name formatPermill
 * @summary         Checks that royalty is in range 0 to 100 and format to permill.
 * @param royalty   Number in range from 0 to 100 with max 4 decimals.
 * @returns         The royalty in permill format.
 */
export const formatPermill = (royalty: number): number => {
  if (royalty > 100 || royalty < 0) {
    throw new Error(Errors.ROYALTY_MUST_BE_PERCENTAGE)
  }

  return parseFloat(royalty.toFixed(4)) * 10000
}
