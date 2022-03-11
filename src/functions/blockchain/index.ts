import { SubmittableExtrinsic } from "@polkadot/api/types"
import { getApi } from "../../utils/blockchain"
import type { ISubmittableResult, IKeyringPair } from "@polkadot/types/types"
// import { getBalance } from "../account"
import BN from "bn.js"
import { txActions, txPallets } from "../../constants"
import { getNftMintFee } from "../nft"
import { getMarketplaceMintFee } from "../marketplace"
import { getCapsuleMintFee } from "../capsule"

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

// create an unsigned transaction in hex format
export const getHexFromTx = async (txPallet: string, txExtrinsic: string, txArgs: any[] = []) => {
  const tx = await createTransaction(txPallet, txExtrinsic, txArgs)
  return tx.toHex()
}

// create a signable transaction from an address and an unsigned transaction
export const getSignedString = async (keyring: IKeyringPair, txHex: `0x${string}`) => {
  const api = await getApi()
  const txSigned = await api.tx(txHex).signAsync(keyring, { nonce: -1, blockHash: api.genesisHash, era: 0 })
  return txSigned.toHex()
}

// sign signable string with seed and get signed payload
export const submitTransaction = async (txHex: `0x${string}`) => {
  const api = await getApi()
  return await api.tx(txHex).send()
}

// sign signable string with seed and get signed payload
export const subscribeAndSubmitTransaction = async (
  txHex: `0x${string}`,
  callback: (result: ISubmittableResult) => void,
) => {
  const api = await getApi()
  let finalHash = undefined
  const unsub = await api.tx(txHex).send(async (result) => {
    try {
      await callback(result)
      if (result.status.isFinalized && unsub && typeof unsub === "function") {
        unsub()
        finalHash = result.txHash.toHex()
      }
    } catch (err) {
      if (unsub && typeof unsub === "function") {
        unsub()
      }
      throw err
    }
  })
  return finalHash
}

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
