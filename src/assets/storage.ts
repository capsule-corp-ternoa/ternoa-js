import { bnToBn } from "@polkadot/util"

import { AccountAssetDataType } from "./types"

import { chainQuery, txPallets } from "../constants"
import { BalanceType, query } from "../blockchain"

/**
 * @name getTotalAssetBalance
 * @summary           The holdings of a specific account for a specific asset.
 * @param assetId     The ID of the asset.
 * @param address   Public address of the account to get balances.
 * @returns           The holdings/balance information of the account : balance, isFrozen: boolean, reason, extra
 */
export const getAccountAssetData = async (assetId: number, address: string): Promise<AccountAssetDataType | null> => {
  const accountData = (
    await query(txPallets.assets, chainQuery.account, [assetId, address])
  ).toJSON() as AccountAssetDataType
  return accountData
}

/**
 * @name getAssetBalance
 * @summary           Get the balance of an account for a specific asset.
 * @param assetId     The ID of the asset.
 * @param address   Public address of the account to get balance.
 * @returns           The balance of the account.
 */
export const getAccountAssetBalance = async (assetId: number, address: string): Promise<BalanceType | null> => {
  const data = await getAccountAssetData(assetId, address)
  const balance = data ? bnToBn(data.balance) : null
  return balance
}
