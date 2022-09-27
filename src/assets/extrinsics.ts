import BN from "bn.js"
import type { IKeyringPair } from "@polkadot/types/types"

import { txActions, txPallets, WaitUntil } from "../constants"
import { createTxHex, numberToBalance, submitTxBlocking, TransactionHashType } from "../blockchain"
import { AssetTransferredEvent } from "../events"

/**
 * @name assetTransferTx
 * @summary             Creates an unsigned unsubmitted Assets-Transfert Transaction Hash.
 * @param id            ID of the Asset
 * @param to        Public address of the account to transfer the amount to.
 * @param amount        Token amount to transfer.
 * @returns             Unsigned unsubmitted Assets-Transfert Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const assetTransferTx = async (id: number, to: string, amount: number | BN): Promise<TransactionHashType> => {
  const formattedAmount = typeof amount === "number" ? await numberToBalance(amount) : amount
  return await createTxHex(txPallets.assets, txActions.transfer, [id, to, formattedAmount])
}

/**
 * @name assetTransfer
 * @summary             Transfers some balance to another account.
 * @param id            ID of the Asset
 * @param to        Public address of the account to transfer the amount to.
 * @param amount        Token amount to transfer.
 * @param keyring       Account that will sign the transaction.
 * @param waitUntil     Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns             AssetTransferredEvent Blockchain event.
 */
export const assetTransfer = async (
  id: number,
  to: string,
  amount: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<AssetTransferredEvent> => {
  const tx = await assetTransferTx(id, to, amount)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(AssetTransferredEvent)
}
