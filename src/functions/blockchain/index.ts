import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getApi } from "../../utils/blockchain"
import { getKeyringFromSeed } from "../account"
import type { ISubmittableResult, SignerPayloadJSON } from "@polkadot/types/types"

export const getQuery = async (module: string, call: string) => {
  const api = await getApi()
  return await api.query[module][call]()
}

// create an unsigned transaction
export const createTransaction = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const api = await getApi()
  return api.tx[txPallet][txExtrinsic](...txArgs)
}

// create a signable transaction from an address and an unsigned transaction
export const createSignableTransaction = async (
  address: string, tx: SubmittableExtrinsic<"promise", ISubmittableResult>,) => {
  const api = await getApi()
  const nextNonce = await api.rpc.system.accountNextIndex(        address
    )
  const payload = api.createType("SignerPayload", {
                method: tx,
nonce: nextNonce,
            genesisHash: api.genesisHash,
            blockHash: api.genesisHash,
            runtimeVersion: api.runtimeVersion,
            version: api.extrinsicVersion,
  })
  console.log("a")
  return payload.toPayload()

}

// sign signable string with seed and get signed payload
export const getSignedTransaction = async (seed: string, payload: SignerPayloadJSON) => {
  const api = await getApi()
  const keypair = await getKeyringFromSeed(seed)
  const { signature } = api.createType("ExtrinsicPayload", payload, { version: api.extrinsicVersion }).sign(keypair)
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
  return await tx.send()
}

// Batches ...
