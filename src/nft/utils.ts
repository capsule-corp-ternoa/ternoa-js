import { Errors } from "../constants"

/**
 * @name formatPermill
 * @summary         Checks that percent is in range 0 to 100 and format to permill.
 * @param percent   Number in range from 0 to 100 with max 4 decimals.
 * @returns         The formated percent in permill format.
 */
export const formatPermill = (percent: number): number => {
  if (percent > 100 || percent < 0) {
    throw new Error(Errors.MUST_BE_PERCENTAGE)
  }

  return parseFloat(percent.toFixed(4)) * 10000
}
