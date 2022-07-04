import { cryptoWaitReady, signatureVerify } from "@polkadot/util-crypto"
import { ApiPromise, WsProvider } from "@polkadot/api"
import type { ISubmittableResult, IKeyringPair } from "@polkadot/types/types"
import { decodeAddress, encodeAddress } from "@polkadot/keyring"
import { formatBalance as formatBalancePolkadotUtil, hexToU8a, isHex, u8aToHex, BN_TEN } from "@polkadot/util"
import BN from "bn.js"

import { txActions, txEvent, txPallets } from "../constants"
import { checkFundsForTxFees } from "../fee"

const DEFAULT_CHAIN_ENDPOINT = "wss://alphanet.ternoa.com"

let api: ApiPromise
let chainEndpoint = DEFAULT_CHAIN_ENDPOINT
let endpointChanged = false

/**
 * @name initializeApi
 * @summary Initialize substrate api with selected or default wss endpoint.
 * @description The default chainEndpoint is "wss://alphanet.ternoa.com"
 */
const initializeApi = async () => {
  await cryptoWaitReady()
  safeDisconnect()
  const wsProvider = new WsProvider(chainEndpoint)
  api = await ApiPromise.create({
    provider: wsProvider,
  })
  endpointChanged = false
}

/**
 * @name changeEndpoint
 * @summary Set the chainEndpoint to specified parameter.
 * @param chain Chain endpoint
 */
export const changeEndpoint = (chain: string) => {
  chainEndpoint = chain
  endpointChanged = true
}

/**
 * @name getRawApi
 * @summary Get initialized substrate Api instance.
 * @returns Promise containing the actual Api instance, a wrapper around the RPC and interfaces of the chain.
 */
export const getRawApi = async () => {
  if (!isApiConnected() || endpointChanged) await initializeApi()
  return api
}

/**
 * @name isApiConnected
 * @summary Check if the Api instance existed and if it is connected.
 * @returns Boolean, true if the underlying provider is connected, false otherwise
 */
export const isApiConnected = () => {
  return Boolean(api && api.isConnected)
}

/**
 * @name getApiEndpoint
 * @summary Returns the wss api endpoint
 * @returns String, the api endpoint connected with.
 */
export const getApiEndpoint = () => {
  return chainEndpoint
}

/**
 * @name safeDisconnect
 * @summary Disconnect safely from the underlying provider, halting all network traffic
 */
export const safeDisconnect = async () => {
  if (isApiConnected()) await api.disconnect()
}

/**
 * @name query
 * @summary Generic function to make a chain query.
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
 * @param module The section required to make the chain query (eg. "system")
 * @param call The call depending on the section (eg. "account")
 * @param args Array of args for the call
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Result of the query storage call
 */
export const query = async (module: string, call: string, args: any[] = [], callback?: (result: any) => void) => {
  const api = await getRawApi()
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
 * @summary Generic function to get a chain constant.
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
export const consts = async (section: string, constantName: string) => {
  const api = await getRawApi()
  return api.consts[section][constantName]
}

/**
 * @name isTransactionSuccess
 * @summary Check if a transaction result is successful.
 * @param result Generic result passed as a parameter in a transaction callback
 * @returns Object containing a boolean success field indicating if transaction is successful
 * and a indexInterrupted field to indicate where the transaction stopped in case of a batch
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

/**
 * @name checkTxAvailable
 * @summary Check if the pallet module and the subsequent extrinsic method exist in the Api instance.
 * @param txPallet Pallet module of the transaction
 * @param txExtrinsic Subsequent extrinsic method of the transaction
 * @returns Boolean, true if the pallet module and the subsequent extrinsic method exist, throw an Error otherwise
 */
export const checkTxAvailable = async (txPallet: string, txExtrinsic: string) => {
  const api = await getRawApi()
  try {
    api.tx[txPallet][txExtrinsic]
    return true
  } catch (err) {
    throw new Error(`${txPallet}_${txExtrinsic} not found, check the selected endpoint`)
  }
}

/**
 * @name createTx
 * @summary Create a transaction.
 * @param txPallet Pallet module of the transaction
 * @param txExtrinsic Subsequent extrinsic method of the transaction
 * @param txArgs Arguments of the transaction
 * @returns Transaction object unsigned
 */
const createTx = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const api = await getRawApi()
  await checkTxAvailable(txPallet, txExtrinsic)
  return api.tx[txPallet][txExtrinsic](...txArgs)
}

/**
 * @name createTxHex
 * @summary Create a transaction in hex format.
 * @param txPallet Pallet module of the transaction
 * @param txExtrinsic Subsequent extrinsic method of the transaction
 * @param txArgs Arguments of the transaction
 * @returns Hex value of the transaction
 */
export const createTxHex = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const tx = await createTx(txPallet, txExtrinsic, txArgs)
  return tx.toHex()
}

/**
 * @name signTx
 * @summary Sign a transaction.
 * @param keyring Keyring pair to sign the data
 * @param txHex Tx hex of the unsigned transaction to be signed
 * @param nonce Nonce to be used in the transaction, default to next available
 * @param validity Number of blocks during which transaction can be submitted, default to immortal
 * @returns Hex value of the signed transaction
 */
export const signTx = async (keyring: IKeyringPair, txHex: `0x${string}`, nonce = -1, validity = 0) => {
  const api = await getRawApi()
  const txSigned = await api.tx(txHex).signAsync(keyring, { nonce, blockHash: api.genesisHash, era: validity })
  return txSigned.toHex()
}

/**
 * @name submitTx
 * @summary Send a signed transaction on the blockchain.
 * @param txHex Transaction hex of the signed transaction to be submitted
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction
 */
export const submitTx = async (txHex: `0x${string}`, callback?: (result: ISubmittableResult) => void) => {
  const api = await getRawApi()
  const tx = api.tx(txHex)
  await checkFundsForTxFees(tx)
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
 * @name runTx
 * @summary Create, sign and submit a transaction on blockchain.
 * @param txPallet Pallet module of the transaction
 * @param txExtrinsic Subsequent extrinsic method of the transaction
 * @param txArgs Arguments of the transaction
 * @param keyring Keyring pair to sign the data, if not given, an unsigned transaction to be signed will be returned
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const runTx = async (
  txPallet: string,
  txExtrinsic: string,
  txArgs: any[],
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const signableTx = await createTxHex(txPallet, txExtrinsic, txArgs)
  if (!keyring) return signableTx
  const signedTx = await signTx(keyring, signableTx)
  return await submitTx(signedTx, callback)
}

/**
 * @name batchTx
 * @summary Create a batch transaction of dispatch calls.
 * @param txHexes Transactions to execute in the batch call
 * @returns Submittable extrinsic unsigned
 */
export const batchTx = async (txHexes: `0x${string}`[]) => {
  const api = await getRawApi()
  const tx = createTx(txPallets.utility, txActions.batch, [txHexes.map((x) => api.tx(x))])
  return tx
}

/**
 * @name batchTxHex
 * @summary Create a batch transaction of dispatch calls in hex format.
 * @param txHexes Transactions to execute in the batch call
 * @returns Hex of the submittable extrinsic unsigned
 */
export const batchTxHex = async (txHexes: `0x${string}`[]) => {
  const tx = await batchTx(txHexes)
  return tx.toHex()
}

/**
 * @name batchAllTx
 * @summary Create a batchAll transaction of dispatch calls.
 * @param txHexes Transactions to execute in the batch call
 * @returns Submittable extrinsic unsigned
 */
export const batchAllTx = async (txHexes: `0x${string}`[]) => {
  const api = await getRawApi()
  const tx = createTx(txPallets.utility, txActions.batchAll, [txHexes.map((x) => api.tx(x))])
  return tx
}

/**
 * @name batchAllTxHex
 * @summary Create a batchAll transaction of dispatch calls in hex format.
 * @param txHexes Transactions to execute in the batch call
 * @returns Hex of the submittable extrinsic unsigned
 */
export const batchAllTxHex = async (txHexes: `0x${string}`[]) => {
  const tx = await batchAllTx(txHexes)
  return tx.toHex()
}

/**
 * @name isValidAddress
 * @summary Check if an address is a valid Ternoa address.
 * @param address
 * @returns Boolean, true if the address is valid, false otherwise
 */
export const isValidAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}

/**
 * @name isValidSignature
 * @summary Check if a message has been signed by the passed address.
 * @param signedMessage Message to check.
 * @param signature
 * @param address Address to verify the signer.
 * @returns Boolean, true if the address signed the message, false otherwise
 */
export const isValidSignature = (signedMessage: string, signature: `0x${string}`, address: string) => {
  const publicKey = decodeAddress(address)
  const hexPublicKey = u8aToHex(publicKey)

  return signatureVerify(signedMessage, signature, hexPublicKey).isValid
}

/**
 * @name formatBalance
 * @summary Format balance from BN to number.
 * @param input BN input.
 * @param withSi Format with SI, i.e. m/M/etc.
 * @param withSiFull Format with full SI, i.e. mili/Mega/etc.
 * @param withUnit Add the unit (useful in Balance formats).
 * @param unit Token Unit.
 * @returns Formatted balance with SI and unit notation.
 */
export const formatBalance = async (input: BN, withSi = true, withSiFull = false, withUnit = true, unit = "CAPS") => {
  const api = await getRawApi()
  const decimals = api.registry.chainDecimals[0]
  formatBalancePolkadotUtil.setDefaults({ decimals, unit })
  return formatBalancePolkadotUtil(input, { withSi, withSiFull, withUnit })
}

/**
 * @name unFormatBalance
 * @summary Format balance from number to BN.
 * @param _input Number input
 * @returns BN output
 */
export const unFormatBalance = async (_input: number) => {
  const input = String(_input)
  const api = await getRawApi()
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
