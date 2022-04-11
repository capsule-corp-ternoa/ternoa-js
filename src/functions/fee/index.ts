import { SubmittableExtrinsic } from "@polkadot/api/types"
import BN from "bn.js"
import type { ISubmittableResult } from "@polkadot/types/types"
import { getApi } from "../blockchain"
import { txActions, txPallets } from "../../constants"
import { getNftMintFee } from "../nft"
import { getMarketplaceMintFee } from "../marketplace"
import { getCapsuleMintFee } from "../capsule"
import { getBalance } from "../balance"

/**
 * Get the gas fee estimation for a transaction and an address
 * @param tx transaction object
 * @param address public address of the sender
 * @returns the fee estimation
 */
export const getTxGasFee = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>, address: string) => {
  const api = await getApi()
  const txCopy = api.tx(tx.toHex())
  const info = await txCopy.paymentInfo(address)
  return info.partialFee
}

/**
 * Get the fee needed by Ternoa treasury for a transaction
 * @param tx transaction object
 * @returns the fee estimation
 */
export const getTxTreasuryFee = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>) => {
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

/**
 * Get the total fees for a transaction hex and an address
 * @param txHex hex of the transaction
 * @param address public address of the sender
 * @returns the sum of the gas fee and the treasury fee
 */
export const getTxFees = async (txHex: `0x${string}`, address: string) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  const extrinsicFee = await getTxGasFee(tx, address)
  const treasuryFee = await getTxTreasuryFee(tx)
  return extrinsicFee.add(treasuryFee)
}

/**
 * Check if a signed tx sender has enough balance to submit
 * @param tx signed transaction object
 */
export const checkBalanceForTx = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>) => {
  const balance = await getBalance(tx.signer.toString())
  const fees = await getTxFees(tx.toHex(), tx.signer.toString())
  if (balance.cmp(fees) === -1) throw new Error("Insufficient funds for gas or treasury")
}
