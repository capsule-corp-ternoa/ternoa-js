import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getApi } from "../../utils/blockchain"
import type { ISubmittableResult, SignerPayloadJSON, IKeyringPair } from "@polkadot/types/types"
import { getBalance } from "../account"
import BN from "bn.js"
import { txActions, txPallets } from "../../constants"
import { getNftMintFee } from "../nft"
import { getMarketplaceMintFee } from "../marketplace"
import { getCapsuleMintFee } from "../capsule"

//Generic function to get any query doable on polkadot UI
export const getQuery = async (module: string, call: string, args: any[] = []) => {
  const api = await getApi()
  return await api.query[module][call](...args)
}

// create an unsigned transaction
export const createTransaction = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const api = await getApi()
  console.log("tx hex", api.tx[txPallet][txExtrinsic](...txArgs).toHex())
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
    address: address,
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
export const submitTransaction = async (signedPayload: `0x${string}`, payload: SignerPayloadJSON) => {
  const api = await getApi()
  console.log("payload", payload)
  // check balannnnnnce here
  const tx = api.tx("0xb4040300000687ecfe54a6970a799958522f58646c446891535cc54fa5cd0d7c3a8f6ab10513000064a7b3b6e00d")
  tx.addSignature(payload.address, signedPayload, payload)
  const hash = await tx.send()
  return hash.toHex()
}

// get estimation of transaction cost in gas
export const getTransactionGasFee = async (
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
  address: string,
) => {
  const info = await tx.paymentInfo(address)
  return info.partialFee
}

// get transaction cost for specific transaction (nfts, capsule, marketplace)
export const getTransactionTreasuryFee = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>) => {
  switch (`${tx.method.section}_${tx.method.method}`) {
    case `${txPallets.nfts}_${txActions.create}`: {
      return await getNftMintFee()
    }
    case `${txPallets.marketplace}_${txActions.create}`: {
      return await getMarketplaceMintFee()
    }
    case `${txPallets.capsules}_${txActions.create}`: {
      const capsuleMintFee = await getCapsuleMintFee()
      const nftMintFee = await getNftMintFee()
      return capsuleMintFee.add(nftMintFee)
    }
    case `${txPallets.capsules}_${txActions.createFromNft}`: {
      return await getCapsuleMintFee()
    }
    default: {
      return new BN(0)
    }
  }
}

export const getTransactionFees = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>, address: string) => {
  const extrinsicFee = await getTransactionGasFee(tx, address)
  const treasuryFee = await getTransactionTreasuryFee(tx)
  return extrinsicFee.add(treasuryFee)
}

// run a transaction from beginning to end
export const runTransaction = async (txPallet: string, txExtrinsic: string, txArgs: any[], keyring: IKeyringPair) => {
  const tx = await createTransaction(txPallet, txExtrinsic, txArgs)
  const balance = await getBalance(keyring.address)
  const fees = await getTransactionFees(tx, keyring.address)
  if (balance.cmp(fees) === -1) throw new Error("Insufficient funds for gas or treasury")
  const payload = await createSignableTransaction(keyring.address, tx)
  const signedPayload = await getSignedTransaction(keyring, payload)
  const hash = await submitTransaction(signedPayload, payload)
  return hash
}

// Batches ...
