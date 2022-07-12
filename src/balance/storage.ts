import BN from "bn.js"
import { chainQuery, txPallets } from "../constants"
import { query, numberToBalance } from "../blockchain"

/**
 * @name getBalances
 * @summary Get the balances of an account including free, reserved, miscFrozen and feeFrozen balances as well as the total.
 * @param address Public address of the account to get balances
 * @returns The balances of the account
 */
export const getBalances = async (
  address: string,
): Promise<{
  free: BN
  reserved: BN
  miscFrozen: BN
  feeFrozen: BN
}> => {
  const balances: { free: BN; reserved: BN; miscFrozen: BN; feeFrozen: BN } = (
    (await query(txPallets.system, chainQuery.account, [address])) as any
  ).data
  return balances
}

/**
 * @name getTotalBalance
 * @summary Get the total balance of an account (free & reserve balances)
 * @param address Public address of the account to get total balance for
 * @returns The total balance of an account (free & reserve balances)
 */
export const getTotalBalance = async (address: string): Promise<BN> => {
  const { free, reserved } = await getBalances(address)
  return free.add(reserved)
}

/**
 * @name getTransferrableBalance
 * @summary Get the transferrable balance of an account
 * @param address Public address of the account to get transferrable balance for
 * @returns The transferrable balance of an account
 */
export const getTransferrableBalance = async (address: string): Promise<BN> => {
  const { free, miscFrozen } = await getBalances(address)
  return free.sub(miscFrozen)
}

/**
 * @name checkBalanceForTransfer
 * @summary Check if an account as enough funds to ensure a transfer
 * @param address Public address of the account to check balance for transfer
 * @param value Token amount to transfer
 */
export const checkBalanceForTransfer = async (address: string, value: number | BN): Promise<boolean> => {
  const amount = typeof value === "number" ? await numberToBalance(value) : value
  const { free } = await getBalances(address)

  return free.gt(amount)
}
