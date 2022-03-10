import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getApi } from "../../utils/blockchain"
import type { ISubmittableResult, SignerPayloadJSON, IKeyringPair } from "@polkadot/types/types"
import { getBalance } from "../account"

//Generic function to get any query doable on polkadot UI
export const getQuery = async (module: string, call: string, args: any[] = []) => {
  const api = await getApi()
  return await api.query[module][call](...args)
}

// create an unsigned transaction
export const createTransaction = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const api = await getApi()
  return api.tx[txPallet][txExtrinsic](...txArgs)
}

// create a signable transaction from an address and an unsigned transaction
export const createSignableTransaction = async (
  address: string,
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
) => {
  const api = await getApi()
  const nextNonce = await api.rpc.system.accountNextIndex(address)
  const payload = api.createType("SignerPayload", {
    method: tx,
    nonce: nextNonce,
    genesisHash: api.genesisHash,
    blockHash: api.genesisHash,
    runtimeVersion: api.runtimeVersion,
    version: api.extrinsicVersion,
  })
  return payload.toPayload()
}

// sign signable string with seed and get signed payload
export const getSignedTransaction = async (keyring: IKeyringPair, payload: SignerPayloadJSON) => {
  const api = await getApi()
  const { signature } = api.createType("ExtrinsicPayload", payload, { version: api.extrinsicVersion }).sign(keyring)
  return signature
}

// submit transaction with signed payload
export const submitTransaction = async (
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
  address: string,
  signedPayload: `0x${string}`,
  payload: SignerPayloadJSON,
) => {
  tx.addSignature(address, signedPayload, payload)
  const hash = await tx.send()
  return hash.toHex()
}

// get estimation of transaction cost in gas
export const getTransactionEstimate = async (
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
  address: string,
) => {
  const info = await tx.paymentInfo(address)
  return info.partialFee
}

// run a transaction from beginning to end
export const runTransaction = async (txPallet: string, txExtrinsic: string, txArgs: any[], keyring: IKeyringPair) => {
  const tx = await createTransaction(txPallet, txExtrinsic, txArgs)
  const balance = await getBalance(keyring.address)
  const fees = await getTransactionEstimate(tx, keyring.address)
  if (balance.cmp(fees) === -1) throw new Error("Insufficient funds for gas")
  const payload = await createSignableTransaction(keyring.address, tx)
  const signedPayload = await getSignedTransaction(keyring, payload)
  const hash = await submitTransaction(tx, keyring.address, signedPayload, payload)
  return hash
}

// Batches ...
