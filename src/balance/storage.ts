import BN from "bn.js"

import { chainQuery, txPallets } from "../constants"
import { query, numberToBalance } from "../blockchain"
import { Balances } from "./types"

/**
 * @name getBalances
 * @summary             Get the balances of an account including free & reserved balances as well as the total.
 * Currently Mainnet also returns miscFrozen & feeFrozen while alphanet returns frozen and flags. After next Mainnet runtime upgrade both miscFrozen & feeFrozen will be removed.
 * @param address       Public address of the account to get balances.
 * @returns             The balances of the account.
 */
export const getBalances = async (address: string): Promise<Balances> => {
  const balances: Balances = ((await query(txPallets.system, chainQuery.account, [address])) as any).data
  return balances
}

/**
 * @name getTotalBalance
 * @summary             Get the total balance of an account (free & reserve balances)
 * @param address       Public address of the account to get total balance for.
 * @returns             The total balance of an account (free & reserve balances)
 */
export const getTotalBalance = async (address: string): Promise<BN> => {
  const { free, reserved } = await getBalances(address)
  return free.add(reserved)
}

/**
 * @name getTransferrableBalance
 * @summary             Get the transferrable balance of an account.
 * @param address       Public address of the account to get transferrable balance for.
 * @returns             The transferrable balance of an account.
 */
export const getTransferrableBalance = async (address: string): Promise<BN> => {
  const { free, miscFrozen, feeFrozen, frozen } = await getBalances(address)

  let totalFrozen

  if (miscFrozen !== undefined && feeFrozen !== undefined) {
    if (feeFrozen.gt(miscFrozen)) {
      totalFrozen = feeFrozen
    } else {
      totalFrozen = miscFrozen
    }
    return free.sub(totalFrozen)
  } else if (frozen) {
    return free.sub(frozen)
  }
  return free
}

/**
 * @name checkBalanceForTransfer
 * @summary             Check if an account as enough funds to ensure a transfer.
 * @param address       Public address of the account to check balance for transfer.
 * @param value         Token amount to check before transfer.
 */
export const checkBalanceForTransfer = async (address: string, value: number | BN): Promise<boolean> => {
  const amount = typeof value === "number" ? numberToBalance(value) : value
  const { free } = await getBalances(address)

  return free.gt(amount)
}
