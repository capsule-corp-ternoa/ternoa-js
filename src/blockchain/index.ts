import BN from "bn.js"
import { cryptoWaitReady, signatureVerify } from "@polkadot/util-crypto"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import type { ISubmittableResult, IKeyringPair, Codec } from "@polkadot/types/types"
import { decodeAddress, encodeAddress } from "@polkadot/keyring"
import { formatBalance as formatBalancePolkadotUtil, hexToU8a, isHex, u8aToHex, BN_TEN } from "@polkadot/util"
import type { Balance } from "@polkadot/types/interfaces/runtime"

import { getTransferrableBalance } from "../balance"
import { Errors, txActions, txPallets, WaitUntil } from "../constants"
import {
  BatchCompletedWithErrorsEvent,
  BatchInterruptedEvent,
  BlockchainEvent,
  BlockchainEvents,
  ExtrinsicFailedEvent,
  ItemFailedEvent,
} from "../events"
import { getMarketplaceMintFee } from "../marketplace"
import { getNftMintFee } from "../nft"

import {
  IFormatBalanceOptions,
  SubmitTxBlockingType,
  TransactionHashType,
  CheckTransactionType,
  ICheckBatch,
  ICheckForceBatch,
} from "./types"
import { BlockInfo, ConditionalVariable } from "./utils"

const DEFAULT_CHAIN_ENDPOINT = "wss://alphanet.ternoa.com"

let api: ApiPromise
let chainEndpoint = DEFAULT_CHAIN_ENDPOINT

/**
 * @name initializeApi
 * @summary       Initialize substrate api with selected or default wss endpoint.
 * @description   The default chainEndpoint is "wss://alphanet.ternoa.com"
 */
export const initializeApi = async (endpoint?: string): Promise<void> => {
  if (endpoint) chainEndpoint = endpoint
  await cryptoWaitReady()
  safeDisconnect()
  const wsProvider = new WsProvider(chainEndpoint)
  api = await ApiPromise.create({
    provider: wsProvider,
  })
}

/**
 * @name getRawApi
 * @summary   Get initialized substrate Api instance.
 * @returns   Raw polkadot api instance, a wrapper around the RPC and interfaces of the chain.
 */
export const getRawApi = (): ApiPromise => {
  if (!api) throw new Error(Errors.API_NOT_INITIALIZED)
  if (!api.isConnected) throw new Error(Errors.API_NOT_CONNECTED)
  return api
}

/**
 * @name isApiConnected
 * @summary   Check if the Api instance existed and if it is connected.
 * @returns   Boolean, true if the underlying provider is connected, false otherwise
 */
export const isApiConnected = (): boolean => {
  return Boolean(api && api.isConnected)
}

/**
 * @name getApiEndpoint
 * @summary   Returns the wss api endpoint
 * @returns   String, the api endpoint connected with.
 */
export const getApiEndpoint = (): string => {
  return chainEndpoint
}

/**
 * @name safeDisconnect
 * @summary   Disconnect safely from the underlying provider, halting all network traffic
 */
export const safeDisconnect = async (): Promise<void> => {
  if (isApiConnected()) await api.disconnect()
}

/**
 * @name query
 * @summary   Generic function to make a chain query.
 * @example
 * <BR>
 *
 * ```javascript
 * // you can query without any args
 * const data = await query('balances', 'totalIssuance');
 *
 * // or you can pass args parameters to the storage query
 * const data = await query('system', 'account', ['5GesFQSwhmuMKAHcDrfm21Z5xrq6kW93C1ch2Xosq1rXx2Eh']);
 *
 * ```
 * @param module    The section required to make the chain query (eg. "system")
 * @param call      The call depending on the section (eg. "account")
 * @param args      Array of args for the call
 * @param callback  Callback function to enable subscription, if not given, no subscription will be made
 * @returns         Result of the query storage call
 */
export const query = async (
  module: string,
  call: string,
  args: any[] = [],
  callback?: (result: any) => void,
): Promise<Codec> => {
  const api = getRawApi()
  if (!callback) {
    return await api.query[module][call](...args)
  } else {
    return await api.query[module][call](...args, async (result: any) => {
      await callback(result)
    })
  }
}

/**
 * @name consts
 * @summary   Generic function to get a chain constant.
 * @example
 * <BR>
 *
 * ```javascript
 * console.log(api.consts.balances.existentialDeposit.toString())
 * ```
 *
 * @param section The section required to get the chain constant (eg. "balances")
 * @param constantName The constantName depending on the section (eg. "existentialDeposit")
 * @returns The constant value
 */
export const consts = (section: string, constantName: string): Codec => {
  return getRawApi().consts[section][constantName]
}

/**
 * @name getTxInitialFee
 * @summary         Get the weight fee estimation for a transaction.
 * @param txHex     Transaction hex
 * @param address   Public address of the sender
 * @returns         Transaction fee estimation
 */
export const getTxInitialFee = async (txHex: TransactionHashType, address: string): Promise<Balance> => {
  const api = getRawApi()
  const tx = api.tx(txHex)
  const info = await tx.paymentInfo(address)
  return info.partialFee
}

/**
 * @name getTxAdditionalFee
 * @summary       Get the fee needed by Ternoa for specific transaction services.
 * @description   Some Ternoa's services required additional fees on top of chain gas fees, for example: minting a marketplace, minting an NFT or creating a capsule.
 * @param txHex   Transaction hex
 * @returns       Fee estimation
 */
export const getTxAdditionalFee = async (txHex: TransactionHashType): Promise<BN> => {
  const api = getRawApi()
  const tx = api.tx(txHex)
  switch (`${tx.method.section}_${tx.method.method}`) {
    case `${txPallets.nft}_${txActions.createNft}`: {
      return await getNftMintFee()
    }
    case `${txPallets.marketplace}_${txActions.create}`: {
      return await getMarketplaceMintFee()
    }
    default: {
      return new BN(0)
    }
  }
}

/**
 * @name getTxFees
 * @summary         Get the total fees for a transaction hex.
 * @param txHex     Hex of the transaction
 * @param address   Public address of the sender
 * @returns         Total estimated fee which is the sum of the chain initial fee and the optional additional fee
 */
export const getTxFees = async (txHex: TransactionHashType, address: string): Promise<BN> => {
  const extrinsicFee = await getTxInitialFee(txHex, address)
  const additionalFee = await getTxAdditionalFee(txHex)
  return extrinsicFee.add(additionalFee)
}

/**
 * @name checkFundsForTxFees
 * @summary   Check if a signed transaction sender has enough funds to pay transaction gas fees on transaction submit.
 * @param tx  Signed transaction object
 */
export const checkFundsForTxFees = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>): Promise<void> => {
  const balance = await getTransferrableBalance(tx.signer.toString())
  const fees = await getTxFees(tx.toHex(), tx.signer.toString())
  if (balance.cmp(fees) === -1) throw new Error(Errors.INSUFFICIENT_FUNDS)
}

/**
 * @name checkTransactionSuccess
 * @summary       Check if a transaction is successful.
 * @param events  Result from a submitTxBlocking function: An events list.
 * @returns       Object containing a boolean success field indicating if transaction is successful
 *                and a the list of events in case of success or the Failed Event in case of transaction failure.
 */
export const checkTransactionSuccess = (events: BlockchainEvents): CheckTransactionType => {
  const failedEvent = events.findEvent(ExtrinsicFailedEvent)
  if (failedEvent) {
    return {
      isTxSuccess: false,
      failedEvent,
    }
  }
  return {
    isTxSuccess: true,
    events,
  }
}

/**
 * @name checkBatch
 * @summary                          Check if a classic batch of transactions is successful without being interrupted. For BatchAll or ForceBatch tx, use the corresponding helper.
 * @param batchedTransactionsEvents  Result from a submitTxBlocking function triggered after a batch transaction: An events list.
 * @returns                          Object containing an isBatchInterrupted boolean, the succeeded or interrupted events and a isTxSuccess boolean to check the batch transaction status.
 */
export const checkBatch = (batchedTransactionsEvents: BlockchainEvents): ICheckBatch => {
  const batchInterruptedEvent = batchedTransactionsEvents.findEvent(BatchInterruptedEvent)
  const checkTx = checkTransactionSuccess(batchedTransactionsEvents)
  if (batchInterruptedEvent) {
    return {
      isBatchInterrupted: true,
      batchInterruptedEvent,
      indexInterrupted: batchInterruptedEvent.index,
      isTxSuccess: true,
    }
  }
  return { ...checkTx, isBatchInterrupted: false }
}

/**
 * @name checkForceBatch
 * @summary                          Check if a forceBatch of transactions is completed without errors. For BatchAll or Batch tx, use the corresponding helper.
 * @param batchedTransactionsEvents  Result from a submitTxBlocking function triggered after a forceBatch transaction: An events list.
 * @returns                          Object containing an isBatchCompleteWithoutErrors boolean, the succeeded or interrupted events and a isTxSuccess boolean to check the forceBatch transaction status.
 */
export const checkForceBatch = (batchedTransactionsEvents: BlockchainEvents): ICheckForceBatch => {
  const batchIncompletedEvent = batchedTransactionsEvents.findEvent(BatchCompletedWithErrorsEvent)
  const checkTx = checkTransactionSuccess(batchedTransactionsEvents)
  if (batchIncompletedEvent) {
    return {
      isBatchCompleteWithoutErrors: false,
      failedItems: batchedTransactionsEvents.findEvents(ItemFailedEvent),
      isTxSuccess: true,
    }
  }
  return { ...checkTx, isBatchCompleteWithoutErrors: true }
}

/**
 * @name checkBatchAll
 * @summary                          Check if a batchAll of transactions is succeeded or failed. For forceBatch or Batch tx, use the corresponding helper.
 * @param batchedTransactionsEvents  Result from a submitTxBlocking function triggered after a batchAll transaction: An events list.
 * @returns                          Object containing the succeeded or interrupted events and a isTxSuccess boolean to check the batchAll transaction status.
 */
export const checkBatchAll = (batchedTransactionsEvents: BlockchainEvents): CheckTransactionType => {
  return checkTransactionSuccess(batchedTransactionsEvents)
}

/**
 * @name createTx
 * @summary             Create a transaction.
 * @param txPallet      Pallet module of the transaction
 * @param txExtrinsic   Subsequent extrinsic method of the transaction
 * @param txArgs        Arguments of the transaction
 * @returns             Transaction object unsigned
 */
export const createTx = async (
  txPallet: string,
  txExtrinsic: string,
  txArgs: any[] = [],
): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> => getRawApi().tx[txPallet][txExtrinsic](...txArgs)

/**
 * @name createTxHex
 * @summary             Create a transaction in hex format.
 * @param txPallet      Pallet module of the transaction
 * @param txExtrinsic   Subsequent extrinsic method of the transaction
 * @param txArgs        Arguments of the transaction
 * @returns             Hex value of the transaction
 */
export const createTxHex = async (
  txPallet: string,
  txExtrinsic: string,
  txArgs: any[] = [],
): Promise<TransactionHashType> => {
  const tx = await createTx(txPallet, txExtrinsic, txArgs)
  return tx.toHex()
}

/**
 * @name signTxHex
 * @summary         Sign a transaction.
 * @param keyring   Keyring pair to sign the data
 * @param txHex     Tx hex of the unsigned transaction to be signed
 * @param nonce     Nonce to be used in the transaction, default to next available
 * @param validity  Number of blocks during which transaction can be submitted, default to immortal
 * @returns         Hex value of the signed transaction
 */
export const signTxHex = async (
  keyring: IKeyringPair,
  txHex: TransactionHashType,
  nonce = -1,
  validity = 0,
): Promise<TransactionHashType> => {
  const txSigned = await getRawApi().tx(txHex).signAsync(keyring, { nonce, blockHash: api.genesisHash, era: validity })
  return txSigned.toHex()
}

/**
 * @name submitTxHex
 * @summary         Send a signed transaction on the blockchain.
 * @param txHex     Transaction hex of the signed transaction to be submitted
 * @param callback  Callback function to enable subscription, if not given, no subscription will be made
 * @returns         Hash of the transaction
 */
export const submitTxHex = async (
  txHex: TransactionHashType,
  callback?: (result: ISubmittableResult) => void,
): Promise<TransactionHashType> => {
  const api = getRawApi()
  const tx = api.tx(txHex)
  if (callback === undefined) {
    await tx.send()
  } else {
    const unsub = await tx.send(async (result) => {
      try {
        await callback(result)
        if (result.status.isFinalized) {
          unsub()
        }
      } catch (err) {
        unsub()
        throw err
      }
    })
  }
  return tx.hash.toHex()
}

/**
 * @name batchTx
 * @summary         Create a batch transaction of dispatch calls.
 * @param txHexes   Transactions to execute in the batch call
 * @returns         Submittable extrinsic unsigned
 * @see             Learn more about Batch best practices {@link https://github.com/capsule-corp-ternoa/ternoa-js/wiki/5-Work-In-Progress-:-Cookbook#utility-batchbatchall here}.
 */
export const batchTx = async (
  txHexes: TransactionHashType[],
): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> => {
  const api = getRawApi()
  const tx = createTx(txPallets.utility, txActions.batch, [txHexes.map((x) => api.tx(x))])
  return tx
}

/**
 * @name batchTxHex
 * @summary         Create a batch transaction of dispatch calls in hex format.
 * @param txHexes   Transactions to execute in the batch call
 * @returns         Hex of the submittable extrinsic unsigned
 * @see             Learn more about Batch best practices {@link https://github.com/capsule-corp-ternoa/ternoa-js/wiki/5-Work-In-Progress-:-Cookbook#utility-batchbatchall here}.
 */
export const batchTxHex = async (txHexes: TransactionHashType[]): Promise<TransactionHashType> => {
  const tx = await batchTx(txHexes)
  return tx.toHex()
}

/**
 * @name batchAllTx
 * @summary         Create a batchAll transaction of dispatch calls.
 * @param txHexes   Transactions to execute in the batch call
 * @returns         Submittable extrinsic unsigned
 * @see             Learn more about Batch best practices {@link https://github.com/capsule-corp-ternoa/ternoa-js/wiki/5-Work-In-Progress-:-Cookbook#utility-batchbatchall here}.
 */
export const batchAllTx = async (
  txHexes: TransactionHashType[],
): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> => {
  const api = getRawApi()
  const tx = createTx(txPallets.utility, txActions.batchAll, [txHexes.map((x) => api.tx(x))])
  return tx
}

/**
 * @name batchAllTxHex
 * @summary         Create a batchAll transaction of dispatch calls in hex format.
 * @param txHexes   Transactions to execute in the batch call
 * @returns         Hex of the submittable extrinsic unsigned
 * @see             Learn more about Batch best practices {@link https://github.com/capsule-corp-ternoa/ternoa-js/wiki/5-Work-In-Progress-:-Cookbook#utility-batchbatchall here}.
 */
export const batchAllTxHex = async (txHexes: TransactionHashType[]): Promise<TransactionHashType> => {
  const tx = await batchAllTx(txHexes)
  return tx.toHex()
}

/**
 * @name forceBatchTx
 * @summary         Create a forceBatch transaction of dispatch calls.
 * @param txHexes   Transactions to execute in the batch call
 * @returns         Submittable extrinsic unsigned
 * @see             Learn more about Batch best practices {@link https://github.com/capsule-corp-ternoa/ternoa-js/wiki/5-Work-In-Progress-:-Cookbook#utility-batchbatchall here}.
 */
export const forceBatchTx = async (
  txHexes: TransactionHashType[],
): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> => {
  const api = getRawApi()
  const tx = createTx(txPallets.utility, txActions.forceBatch, [txHexes.map((x) => api.tx(x))])
  return tx
}

/**
 * @name forceBatchTxHex
 * @summary         Create a forceBatch transaction of dispatch calls in hex format.
 * @param txHexes   Transactions to execute in the batch call
 * @returns         Hex of the submittable extrinsic unsigned
 * @see             Learn more about Batch best practices {@link https://github.com/capsule-corp-ternoa/ternoa-js/wiki/5-Work-In-Progress-:-Cookbook#utility-batchbatchall here}.
 */
export const forceBatchTxHex = async (txHexes: TransactionHashType[]): Promise<TransactionHashType> => {
  const tx = await forceBatchTx(txHexes)
  return tx.toHex()
}

/**
 * @name isValidAddress
 * @summary   Check if an address is a valid Ternoa address.
 * @param address
 * @returns   Boolean, true if the address is valid, false otherwise
 */
export const isValidAddress = (address: string): boolean => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}

/**
 * @name isValidSignature
 * @summary               Check if a message has been signed by the passed address.
 * @param signedMessage   Message to check.
 * @param signature
 * @param address         Address to verify the signer.
 * @returns               Boolean, true if the address signed the message, false otherwise
 */
export const isValidSignature = (signedMessage: string, signature: TransactionHashType, address: string): boolean => {
  const publicKey = decodeAddress(address)
  const hexPublicKey = u8aToHex(publicKey)

  return signatureVerify(signedMessage, signature, hexPublicKey).isValid
}

/**
 * @name balanceToNumber
 * @summary         Format balance from BN to number.
 * @param input     BN input.
 * @param options   Formatting options from IFormatBalanceOptions.
 * @returns         Formatted balance with SI and unit notation.
 */
export const balanceToNumber = (input: BN, options?: IFormatBalanceOptions): string => {
  formatBalancePolkadotUtil.setDefaults({ decimals: 18, unit: options?.unit ?? "CAPS" })
  return formatBalancePolkadotUtil(input, options)
}

/**
 * @name numberToBalance
 * @summary       Format balance from number to BN.
 * @param _input  Number input
 * @returns       BN output
 */
export const numberToBalance = async (_input: number): Promise<BN> => {
  const input = String(_input)
  const api = getRawApi()
  const siPower = new BN(api.registry.chainDecimals[0])
  const basePower = api.registry.chainDecimals[0]
  const siUnitPower = 0
  const isDecimalValue = input.match(/^(\d+)\.(\d+)$/)
  let result

  if (isDecimalValue) {
    if (siUnitPower - isDecimalValue[2].length < -basePower) {
      result = new BN(-1)
    }
    const div = new BN(input.replace(/\.\d*$/, ""))
    const modString = input.replace(/^\d+\./, "").substring(0, api.registry.chainDecimals[0] + 1)
    const mod = new BN(modString)
    result = div.mul(BN_TEN.pow(siPower)).add(mod.mul(BN_TEN.pow(new BN(basePower + siUnitPower - modString.length))))
  } else {
    result = new BN(input.replace(/[^\d]/g, "")).mul(BN_TEN.pow(siPower))
  }
  return result
}

/**
 * @name submitTxBlocking
 * @summary             Signs and submits a transaction. It blocks the execution flow until the transaction is in a block or in a finalized block.
 * @param tx            Unsigned unsubmitted transaction Hash. The Hash is only valid for 5 minutes.
 * @param waitUntil     Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @param keyring       Account that will sign the transaction if provided
 * @returns             A list of blockchain events related to an extrinsics execution.
 */
export const submitTxBlocking = async (
  tx: TransactionHashType,
  waitUntil: WaitUntil,
  keyring?: IKeyringPair,
): Promise<SubmitTxBlockingType> => {
  const [conVar, events, blockInfo] = await submitTxNonBlocking(tx, waitUntil, keyring)
  await conVar.wait()

  return {
    blockInfo,
    events,
  }
}

/**
 * @name submitTxNonBlocking
 * @summary             Signs and submits a transaction in a non-blocking way. Signing is optional.
 * @param tx            Unsigned unsubmitted transaction Hash. The Hash is only valid for 5 minutes.
 * @param waitUntil     Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @param keyring       Account that will sign the transaction if provided
 * @returns             Returns a pair objects that are used to track the progress of the transaction execution. The first returned object is a conditional variable which can yield the information if the operation is finished. The second returned objects is an array of events which gets populated automatically once the operation is finished.
 */
export const submitTxNonBlocking = async (
  tx: TransactionHashType,
  waitUntil: WaitUntil,
  keyring?: IKeyringPair,
): Promise<[ConditionalVariable, BlockchainEvents, BlockInfo]> => {
  const conVar = new ConditionalVariable(500)
  const chainEvents: BlockchainEvents = new BlockchainEvents([])
  const blockInfo = new BlockInfo()

  if (keyring) {
    tx = await signTxHex(keyring, tx)
  }

  const callback = async ({ events, status }: ISubmittableResult) => {
    const isWaitingFinalization = status.isFinalized && waitUntil == WaitUntil.BlockFinalization
    const isWaitingInclusion = status.isInBlock && waitUntil == WaitUntil.BlockInclusion

    if (isWaitingInclusion || isWaitingFinalization) {
      chainEvents.inner = events.map((eventRecord) => BlockchainEvent.fromEvent(eventRecord.event))
      const blockHash = isWaitingFinalization ? status.asFinalized.toString() : status.asInBlock.toString()
      const blockData = await api.rpc.chain.getBlock(blockHash)
      blockInfo.blockHash = blockHash
      blockInfo.block = blockData.block
      conVar.notify()
    }
  }

  await submitTxHex(tx, callback)

  return [conVar, chainEvents, blockInfo]
}

export * from "./types"
export * from "./utils"
