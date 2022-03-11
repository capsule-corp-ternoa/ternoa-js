import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getApi } from "../../utils/blockchain"
import type { ISubmittableResult, IKeyringPair } from "@polkadot/types/types"
import BN from "bn.js"
import { txActions, txEvent, txPallets } from "../../constants"
import { getNftMintFee } from "../nft"
import { getMarketplaceMintFee } from "../marketplace"
import { getCapsuleMintFee } from "../capsule"
import { getBalance } from "../account"

// get estimation of transaction cost in gas
export const getTransactionGasFee = async (
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
  address: string,
) => {
  const api = await getApi()
  const txCopy = api.tx(tx.toHex())
  const info = await txCopy.paymentInfo(address)
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

export const getTransactionFees = async (txHex: `0x${string}`, address: string) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  const extrinsicFee = await getTransactionGasFee(tx, address)
  const treasuryFee = await getTransactionTreasuryFee(tx)
  return extrinsicFee.add(treasuryFee)
}

export const checkBalanceForTx = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>) => {
  const balance = await getBalance(tx.signer.toString())
  const fees = await getTransactionFees(tx.toHex(), tx.signer.toString())
  if (balance.cmp(fees) === -1) throw new Error("Insufficient funds for gas or treasury")
}

//Generic function to get any query doable on polkadot UI
export const getQuery = async (module: string, call: string, args: any[] = []) => {
  const api = await getApi()
  return await api.query[module][call](...args)
}

//Generic function to get and subscribe to any query doable on polkadot UI
export const getQueryAndSubscribe = async (
  module: string,
  call: string,
  args: any[] = [],
  callback: (result: any) => void,
) => {
  const api = await getApi()
  await api.query[module][call](...args, async (result: any) => {
    await callback(result)
  })
}

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
const createTransaction = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const api = await getApi()
  return api.tx[txPallet][txExtrinsic](...txArgs)
}

// create an unsigned transaction in hex format
export const getHexFromTx = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const tx = await createTransaction(txPallet, txExtrinsic, txArgs)
  return tx.toHex()
}

// sign signable string with keyring and tx hex
export const getSignedString = async (keyring: IKeyringPair, txHex: `0x${string}`) => {
  const api = await getApi()
  const txSigned = await api.tx(txHex).signAsync(keyring, { nonce: -1, blockHash: api.genesisHash, era: 0 })
  return txSigned.toHex()
}

// send tx on blockchain
export const submitTransaction = async (txHex: `0x${string}`) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  await checkBalanceForTx(tx)
  return await tx.send()
}

// send tx on blockchain and subscribe to it
export const subscribeAndSubmitTransaction = async (
  txHex: `0x${string}`,
  callback: (result: ISubmittableResult) => void,
) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  await checkBalanceForTx(tx)
  const unsub = await tx.send(async (result) => {
    try {
      await callback(result)
      if (result.status.isFinalized && unsub && typeof unsub === "function") {
        unsub()
      }
    } catch (err) {
      if (unsub && typeof unsub === "function") {
        unsub()
      }
      throw err
    }
  })
  return tx.hash.toHex()
}

// Execute a transaction on blockchain
export const runTransaction = async (
  txPallet: string,
  txExtrinsic: string,
  txArgs: any[],
  keyring: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const signableTx = await getHexFromTx(txPallet, txExtrinsic, txArgs)
  const signedTx = await getSignedString(keyring, signableTx)
  if (callback) {
    return await subscribeAndSubmitTransaction(signedTx, callback)
  } else {
    return await submitTransaction(signedTx)
  }
}

// Batches ...
