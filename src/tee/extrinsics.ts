import { IKeyringPair } from "@polkadot/types/types"
import { ReportParamsType } from "./types"
import { TransactionHashType, createTxHex, submitTxBlocking } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import { MetricsServerReportSubmittedEvent, RewardsClaimedEvent } from "../events"

/**
 * @name submitMetricsServerReportTx
 * @summary                         Creates an unsigned unsubmitted Submit Metrics Server Report Transaction Hash for an Era.
 * @param operatorAddress           The operator address to which submitted scores belongs.
 * @param metricsServerReport       The report containing the 5 scores computed for the mentioned era and the submitter's registered address.
 * @returns                         Unsigned unsubmitted Submit Metrics Server Report Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const submitMetricsServerReportTx = async (
  operatorAddress: string,
  metricsServerReport: ReportParamsType,
): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.tee, txActions.submitMetricsServerReport, [operatorAddress, metricsServerReport])
}

/**
 * @name submitMetricsServerReport
 * @summary                         Submit the metrics server report for a specific era.
 * @param operatorAddress           The operator address to which submitted scores belongs.
 * @param metricsServerReport       The report containing the 5 scores computed for the mentioned era and the submitter's registered address.
 * @param keyring                   Account that will sign the transaction.
 * @param waitUntil                 Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns                         MetricsServerReportSubmittedEvent Blockchain event.
 */
export const submitMetricsServerReport = async (
  operatorAddress: string,
  metricsServerReport: ReportParamsType,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MetricsServerReportSubmittedEvent> => {
  const tx = await submitMetricsServerReportTx(operatorAddress, metricsServerReport)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MetricsServerReportSubmittedEvent)
}

/**
 * @name claimTeeRewardsTx
 * @summary                         Creates an unsigned unsubmitted Claim Tee Rewards Transaction Hash for an Era.
 * @param era                       The era to claim the rewards.
 * @returns                         Unsigned unsubmitted Claim Tee Rewards Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const claimTeeRewardsTx = async (era: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.tee, txActions.claimRewards, [era])
}

/**
 * @name claimTeeRewards
 * @summary                         Claim the operator reward for a specific era.
 * @param era                       The era to claim the rewards.
 * @param keyring                   Account that will sign the transaction.
 * @param waitUntil                 Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns                         RewardsClaimedEvent Blockchain event.
 */
export const claimTeeRewards = async (
  era: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<RewardsClaimedEvent> => {
  const tx = await claimTeeRewardsTx(era)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(RewardsClaimedEvent)
}
