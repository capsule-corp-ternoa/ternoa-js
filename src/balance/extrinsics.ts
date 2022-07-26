import BN from "bn.js"
import type { IKeyringPair } from "@polkadot/types/types"

import { createTxHex, submitTxBlocking, numberToBalance, TransactionHashType } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import { BalancesTransferEvent } from "../events"

/**
 * @name balancesTransferTx
 * @summary             Creates an unsigned unsubmitted Balance-Transfert Transaction Hash.
 * @param to            Public address of the account to transfer the amount to.
 * @param value         Token amount to transfer.
 * @returns             Unsigned unsubmitted Balance-Transfert Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const balancesTransferTx = async (to: string, value: number | BN): Promise<TransactionHashType> => {
  const amount = typeof value === "number" ? await numberToBalance(value) : value
  return await createTxHex(txPallets.balances, txActions.transfer, [to, amount])
}

/**
 * @name balancesTransfer
 * @summary             Transfers some liquid free balance to another account.
 * @param to            Public address of the account to transfer the amount to.
 * @param value         Token amount to transfer.
 * @param keyring       Account that will sign the transaction.
 * @param waitUntil     Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns             BalancesTransferEvent Blockchain event.
 */
export const balancesTransfer = async (
  to: string,
  value: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<BalancesTransferEvent> => {
  const tx = await balancesTransferTx(to, value)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(BalancesTransferEvent)
}

/**
 * @name balancesTransferAllTx
 * @summary             Creates an unsigned unsubmitted Balance-TransfertAll Transaction Hash.
 * @param to            Public address of the account to transfer the amount to.
 * @param keepAlive     Ensure that the transfer does not kill the account, it retains the Existential Deposit.
 * @returns             Unsigned unsubmitted Balance-TransfertAll Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const balancesTransferAllTx = async (to: string, keepAlive = true): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.balances, txActions.transferAll, [to, keepAlive])
}

/**
 * @name balancesTransferAll
 * @summary             Transfers the entire transferable balance from the caller account.
 * @param to            Public address of the account to transfer the amount to.
 * @param keepAlive     Ensure that the transfer does not kill the account, it retains the Existential Deposit.
 * @param keyring       Account that will sign the transaction.
 * @param waitUntil     Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns             BalancesTransferEvent Blockchain event.
 */
export const balancesTransferAll = async (
  to: string,
  keepAlive = true,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<BalancesTransferEvent> => {
  const tx = await balancesTransferAllTx(to, keepAlive)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(BalancesTransferEvent)
}

/**
 * @name balancesTransferKeepAliveTx
 * @summary             Creates an unsigned unsubmitted Balance-TransfertKeepAlive Transaction Hash.
 * @param to            Public address of the account to transfer the amount to.
 * @param value         Token amount to transfer.
 * @returns             Unsigned unsubmitted Balance-TransfertKeepAlive Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const balancesTransferKeepAliveTx = async (to: string, value: number | BN): Promise<TransactionHashType> => {
  const amount = typeof value === "number" ? await numberToBalance(value) : value
  return await createTxHex(txPallets.balances, txActions.transferKeepAlive, [to, amount])
}

/**
 * @name balancesTransferKeepAlive
 * @summary             Transfers some liquid free balance to another account with a check that the transfer will not kill the origin account.
 * @param to            Public address of the account to transfer the amount to.
 * @param value         Token amount to transfer.
 * @param keyring       Account that will sign the transaction.
 * @param waitUntil     Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns             BalancesTransferEvent Blockchain event.
 */
export const balancesTransferKeepAlive = async (
  to: string,
  value: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<BalancesTransferEvent> => {
  const tx = await balancesTransferKeepAliveTx(to, value)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(BalancesTransferEvent)
}
