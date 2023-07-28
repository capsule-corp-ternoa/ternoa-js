import { IKeyringPair } from "@polkadot/types/types"
import { ReportParamsType } from "./types"
import { TransactionHashType, createTxHex, submitTxBlocking } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import { MetricsServerReportSubmittedEvent } from "../events"

/**
 * @name submitMetricsServerReportTx
 * @summary                         Creates an unsigned unsubmitted Submit Metrics Server Report Transaction Hash for an Era.
 * @param eraIndex                  The era to which score belongs.
 * @param metricsServerReport       The Report containing an enclave address and the 5 scores computed for the past era.
 * @returns                         Unsigned unsubmitted Submit Metrics Server Report Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const submitMetricsServerReportTx = async (
  eraIndex: number | undefined,
  metricsServerReport: ReportParamsType,
): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.tee, txActions.submitMetricsServerReport, [eraIndex, metricsServerReport])
}

/**
 * @name submitMetricsServerReport
 * @summary                         Submit the metrics server report for the last era.
 * @param eraIndex                  The era to which score belongs.
 * @param metricsServerReport       The Report containing an enclave address and the 5 scores computed for the past era.
 * @param keyring                   Account that will sign the transaction.
 * @param waitUntil                 Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns                         MetricsServerReportSubmittedEvent Blockchain event.
 */
export const submitMetricsServerReport = async (
  eraIndex: number | undefined,
  metricsServerReport: ReportParamsType,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MetricsServerReportSubmittedEvent> => {
  const tx = await submitMetricsServerReportTx(eraIndex, metricsServerReport)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MetricsServerReportSubmittedEvent)
}
