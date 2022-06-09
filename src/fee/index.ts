import { SubmittableExtrinsic } from "@polkadot/api/types"
import BN from "bn.js"
import type { ISubmittableResult } from "@polkadot/types/types"
import { getApi } from "../blockchain"
import { txActions, txPallets } from "../constants"
import { getNftMintFee } from "../nft"
import { getMarketplaceMintFee } from "../marketplace"
import { getCapsuleMintFee } from "../capsule"
import { getFreeBalance } from "../balance"

/**
 * @name getTxGasFee
 * @summary Get the gas fee estimation for a transaction.
 * @param txHex Transaction hex
 * @param address Public address of the sender
 * @returns Transaction fee estimation
 */
export const getTxGasFee = async (txHex: `0x${string}`, address: string) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  const info = await tx.paymentInfo(address)
  return info.partialFee
}

/**
 * @name getTxTreasuryFee
 * @summary Get the fee needed by Ternoa treasury for specific transaction services.
 * @description Some Ternoa's services required additional fees on top of chain gas fees, for example: minting a marketplace, minting an NFT or creating a capsule.
 * @param txHex Transaction hex
 * @returns Fee estimation
 */
export const getTxTreasuryFee = async (txHex: `0x${string}`) => {
  const api = await getApi()
  const tx = api.tx(txHex)
  switch (`${tx.method.section}_${tx.method.method}`) {
    case `${txPallets.nft}_${txActions.create}`: {
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
 * @name getTxFees
 * @summary Get the total fees for a transaction hex.
 * @param txHex Hex of the transaction
 * @param address Public address of the sender
 * @returns Total estimated fee which is the sum of the chain gas fee and the treasury fee
 */
export const getTxFees = async (txHex: `0x${string}`, address: string) => {
  const extrinsicFee = await getTxGasFee(txHex, address)
  const treasuryFee = await getTxTreasuryFee(txHex)
  return extrinsicFee.add(treasuryFee)
}

/**
 * @name checkFundsForTxFees
 * @summary Check if a signed transaction sender has enough funds to pay transaction gas fees on transaction submit.
 * @param tx Signed transaction object
 */
export const checkFundsForTxFees = async (tx: SubmittableExtrinsic<"promise", ISubmittableResult>) => {
  const freeBalance = await getFreeBalance(tx.signer.toString())
  const fees = await getTxFees(tx.toHex(), tx.signer.toString())
  if (freeBalance.cmp(fees) === -1) throw new Error("Insufficient funds for gas or treasury")
}
