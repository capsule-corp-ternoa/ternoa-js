import { bnToBn } from "@polkadot/util"

import { AssetBalanceType } from "./types"

import { chainQuery, txPallets } from "../constants"
import { BalanceType, query } from "../blockchain"

/**
 * @name getTotalAssetBalance
 * @summary           The holdings of a specific account for a specific asset.
 * @param assetId     The ID of the asset.
 * @param AccountId   Public address of the account to get balances.
 * @returns           The holdings/balance information of the account : balance, isFrozen: boolean, reason, extra
 */
export const getTotalAssetBalance = async (assetId: number, AccountId: string): Promise<AssetBalanceType> => {
  const balances = (
    await query(txPallets.assets, chainQuery.account, [assetId, AccountId])
  ).toJSON() as AssetBalanceType
  return balances
}

/**
 * @name getAssetBalance
 * @summary           Get the balance of an account for a specific asset.
 * @param assetId     The ID of the asset.
 * @param AccountId   Public address of the account to get balance.
 * @returns           The balance of the account.
 */
export const getAssetBalance = async (assetId: number, AccountId: string): Promise<BalanceType | null> => {
  const data = await getTotalAssetBalance(assetId, AccountId)
  const balance = data ? bnToBn(data.balance) : null
  return balance
}
