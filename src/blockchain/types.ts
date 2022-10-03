import BN from "bn.js"
import { BatchInterruptedEvent, BlockchainEvents, ExtrinsicFailedEvent, ItemFailedEvent } from "../events"

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

export type CheckTransactionType = {
  isTxSuccess: boolean
  events?: BlockchainEvents
  failedEvent?: ExtrinsicFailedEvent
}
export interface ICheckBatch extends CheckTransactionType {
  isBatchInterrupted: boolean
  indexInterrupted?: number
  batchInterruptedEvent?: BatchInterruptedEvent
}

export interface ICheckForceBatch extends CheckTransactionType {
  isBatchCompleteWithoutErrors?: boolean
  failedItems?: ItemFailedEvent[]
}
