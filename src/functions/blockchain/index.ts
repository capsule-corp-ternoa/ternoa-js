import { getApi } from "../../utils/blockchain"
import type { ISubmittableResult, IKeyringPair } from "@polkadot/types/types"
import { txEvent, txPallets } from "../../constants"
import { checkBalanceForTx } from "../fee"

/**
 * Unsubscibe from any chain subscription (transaction, rpc call, chain query)
 * @param unsub function to unsub returned by polkadot api
 */
export const safeUnsubscribe = (unsub: any) => {
  if (unsub && typeof unsub === "function") unsub()
}

/**
 * Generic function to make a chain query
 * @param module the section required to make the chain query (eg. "system")
 * @param call the call depending on the section (eg. "account")
 * @param args array of args for the call
 * @param callback callback function to enable subscription, if not given, no subscription will be made
 * @returns a function to unsub if callback is given, else the result of the call
 */
export const query = async (module: string, call: string, args: any[] = [], callback?: (result: any) => void) => {
  const api = await getApi()
  if (!callback) {
    return await api.query[module][call](...args)
  } else {
    return await api.query[module][call](...args, async (result: any) => {
      await callback(result)
    })
  }
}

/**
 * Check if a tx result is successful
 * @param result generic result passed as a parameter in a tx callback
 * @returns an object with a boolean success field indicating if tx is successful
 * and a indexInterrupted field to indicate where the tx stopped in case of a batch
 */
export const isTransactionSuccess = (result: ISubmittableResult): { success: boolean; indexInterrupted?: number } => {
  if (!(result.status.isInBlock || result.status.isFinalized))
    throw new Error("Transaction is not finalized or in block")

  const isFailed =
    result.events.findIndex(
      (item) => item.event.section === txPallets.system && item.event.method === txEvent.ExtrinsicFailed,
    ) !== -1
  const indexInterrupted = result.events.findIndex(
    (item) => item.event.section === txPallets.utility && item.event.method === txEvent.BatchInterrupted,
  )
  const isInterrupted = indexInterrupted !== -1
  return {
    success: !isFailed && !isInterrupted,
    indexInterrupted: isInterrupted ? indexInterrupted : undefined,
  }
}

// create an unsigned transaction
/**
 * Create a tx
 * @param txPallet pallet of the tx
 * @param txExtrinsic extrinsic of the tx
 * @param txArgs arguments of the tx
 * @returns a tx object unsigned
 */
const createTx = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const api = await getApi()
  return api.tx[txPallet][txExtrinsic](...txArgs)
}

/**
 * Create a tx
 * @param txPallet pallet of the tx
 * @param txExtrinsic extrinsic of the tx
 * @param txArgs arguments of the tx
 * @returns the hex value of the tx to be constructed again elsewhere
 */
export const createTxHex = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const tx = await createTx(txPallet, txExtrinsic, txArgs)
  return tx.toHex()
}

// sign signable string with keyring and tx hex
/**
 * Sign a transaction
 * @param keyring keyring pair to sign the data
 * @param txHex tx hex of the unsigned tx to be signed
 * @returns the hex value of the signed tx to be constructed again elsewhere
 */
export const signTx = async (keyring: IKeyringPair, txHex: `0x${string}`) => {
  const api = await getApi()
  const txSigned = await api.tx(txHex).signAsync(keyring, { nonce: -1, blockHash: api.genesisHash, era: 0 })
  return txSigned.toHex()
}

// send tx on blockchain
/**
 * Send a signed tx on the blockchain
 * @param txHex tx hex of the signed tx to be submitted
 * @param callback callback function to enable subscription, if not given, no subscription will be made
 * @returns hash of the transaction
 */
export const submitTx = async (txHex: `0x${string}`, callback?: (result: ISubmittableResult) => void) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  await checkBalanceForTx(tx)
  if (!callback) {
    await tx.send()
  } else {
    const unsub = await tx.send(async (result) => {
      try {
        await callback(result)
        if (result.status.isFinalized) {
          safeUnsubscribe(unsub)
        }
      } catch (err) {
        safeUnsubscribe(unsub)
        throw err
      }
    })
  }
  return tx.hash.toHex()
}

// Execute a transaction on blockchain
/**
 * Create, sign and submit a transaction on blockchain
 * @param txPallet pallet of the tx
 * @param txExtrinsic extrinsic of the tx
 * @param txArgs arguments of the tx
 * @param keyring keyring pair to sign the data
 * @param callback callback function to enable subscription, if not given, no subscription will be made
 * @returns hash of the transaction
 */
export const runTx = async (
  txPallet: string,
  txExtrinsic: string,
  txArgs: any[],
  keyring: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const signableTx = await createTxHex(txPallet, txExtrinsic, txArgs)
  const signedTx = await signTx(keyring, signableTx)
  return await submitTx(signedTx, callback)
}

// Batches ...
