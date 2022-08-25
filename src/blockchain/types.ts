import BN from "bn.js"

export interface IFormatBalanceOptions {
  /**
   * @description The number of decimals.
   */
  decimals?: number
  /**
   * @description Format the number with this specific unit.
   */
  forceUnit?: string
  /**
   * @description Format with SI, i.e. m/M/etc.
   */
  withSi?: boolean
  /**
   * @description Format with full SI, i.e. mili/Mega/etc.
   */
  withSiFull?: boolean
  /**
   * @description Add the unit (useful in Balance formats).
   */
  withUnit?: boolean | string
  /**
   * @description Token Unit.
   */
  unit?: string
}

export type TransactionHashType = `0x${string}`
export type BalanceType = BN
