import { cryptoWaitReady } from "@polkadot/util-crypto"
import { ApiPromise, WsProvider } from "@polkadot/api"
import type { ISubmittableResult, IKeyringPair } from "@polkadot/types/types"
import { decodeAddress, encodeAddress } from "@polkadot/keyring"
import { hexToU8a, isHex, BN_TEN } from "@polkadot/util"
import BN from "bn.js"
import { txActions, txEvent, txPallets } from "../constants"
import { checkBalanceForTx } from "../fee"

const DEFAULT_CHAIN_ENDPOINT = "wss://chain-dev-latest.ternoa.dev"

let api: ApiPromise
let chainEndpoint = DEFAULT_CHAIN_ENDPOINT

/**
 * Initialize polkadot api with selected or default wss endpoint
 * @param chain chain endpoint
 */
export const initializeApi = async (chain = chainEndpoint) => {
  await cryptoWaitReady()
  safeDisconnect()
  const wsProvider = new WsProvider(chain)
  api = await ApiPromise.create({
    provider: wsProvider,
  })
  chainEndpoint = chain
}

/**
 * Get initialized polkadot api
 * @returns api
 */
export const getApi = async () => {
  if (!isApiConnected()) await initializeApi()
  return api
}

export const isApiConnected = () => {
  return Boolean(api && api.isConnected)
}

/**
 * Disconnects API
 */
export const safeDisconnect = async () => {
  if (isApiConnected()) await api.disconnect()
}

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
 * Generic function to get a chain constant
 * @param section the section required to get the chain constant (eg. "balances")
 * @param constantName the constantName depending on the section (eg. "existentialDeposit")
 * @returns the constant value
 */
export const consts = async (section: string, constantName: string) => {
  const api = await getApi()
  return api.consts[section][constantName]
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

export const checkTxAvailable = async (txPallet: string, txExtrinsic: string) => {
  const api = await getApi()
  try {
    api.tx[txPallet][txExtrinsic]
    return true
  } catch (err) {
    throw new Error(`${txPallet}_${txExtrinsic} not found, check the selected endpoint`)
  }
}

/**
 * Create a tx
 * @param txPallet pallet of the tx
 * @param txExtrinsic extrinsic of the tx
 * @param txArgs arguments of the tx
 * @returns a tx object unsigned
 */
const createTx = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const api = await getApi()
  await checkTxAvailable(txPallet, txExtrinsic)
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

/**
 * Send a signed tx on the blockchain
 * @param txHex tx hex of the signed tx to be submitted
 * @param callback callback function to enable subscription, if not given, no subscription will be made
 * @returns hash of the transaction
 */
export const submitTx = async (
  txHex: `0x${string}`,
  callback?: (result: ISubmittableResult) => void,
  shouldUnsub = true,
) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  await checkBalanceForTx(tx)
  if (!callback) {
    await tx.send()
  } else {
    const unsub = await tx.send(async (result) => {
      try {
        await callback(result)
        if (shouldUnsub && result.status.isFinalized) {
          safeUnsubscribe(unsub)
        }
      } catch (err) {
        if (shouldUnsub) safeUnsubscribe(unsub)
        throw err
      }
    })
  }
  return tx.hash.toHex()
}

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
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
  shouldUnsub?: boolean,
) => {
  const signableTx = await createTxHex(txPallet, txExtrinsic, txArgs)
  if (!keyring) return signableTx
  const signedTx = await signTx(keyring, signableTx)
  return await submitTx(signedTx, callback, shouldUnsub)
}

/**
 * Create a batch transaction
 * @param txHexes transactions to execute in batch call
 * @returns a submittable extrinsic
 */
export const batchTx = async (txHexes: `0x${string}`[]) => {
  const api = await getApi()
  const tx = createTx(
    txPallets.utility,
    txActions.batch,
    txHexes.map((x) => api.tx(x)),
  )
  return tx
}

/**
 * Create a batch transaction in hex format
 * @param txHexes transactions to execute in batch call
 * @returns the hex of the tx to execute
 */
export const batchTxHex = async (txHexes: `0x${string}`[]) => {
  const tx = await batchTx(txHexes)
  return tx.toHex()
}

/**
 * Create a batch all transaction
 * @param txHexes transactions to execute in batch call
 * @returns a submittable extrinsic
 */
export const batchAllTx = async (txHexes: `0x${string}`[]) => {
  const api = await getApi()
  const tx = createTx(
    txPallets.utility,
    txActions.batchAll,
    txHexes.map((x) => api.tx(x)),
  )
  return tx
}

/**
 * Create a batch all transaction in hex format
 * @param txHexes transactions to execute in batch call
 * @returns the hex of the tx to execute
 */
export const batchAllTxHex = async (txHexes: `0x${string}`[]) => {
  const tx = await batchAllTx(txHexes)
  return tx.toHex()
}

/**
 * check if address is valid polkadot address
 * @param address
 * @returns
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
 * format balance from number to BN
 * @param _input number input
 * @returns BN output
 */
export const unFormatBalance = async (_input: number) => {
  const input = String(_input)
  const api = await getApi()
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
