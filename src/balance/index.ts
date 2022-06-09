import BN from "bn.js"
import type { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { chainQuery, txActions, txPallets } from "../constants"
import { query, runTx, unFormatBalance } from "../blockchain"

/**
 * @name getBalances
 * @summary Get the balances of an account including free, reserved, miscFrozen and feeFrozen balances as well as the total.
 * @param address Public address of the account to get balances
 * @returns The balances of the account
 */
export const getBalances = async (address: string) => {
  const balances: { free: BN; reserved: BN; miscFrozen: BN; feeFrozen: BN } = (
    (await query(txPallets.system, chainQuery.account, [address])) as any
  ).data
  const { free, reserved, miscFrozen, feeFrozen } = balances
  const total = free.add(reserved).add(miscFrozen).add(feeFrozen)
  return { ...balances, total }
}

/**
 * @name getFreeBalance
 * @summary Get the free balance of an account
 * @param address Public address of the account to get free balance for
 * @returns The free balance of the account
 */
export const getBalance = async (address: string) => {
  const balance: { free: BN } = ((await query(txPallets.system, chainQuery.account, [address])) as any).data
  return balance.free
}

/**
 * @name checkBalanceForTransfer
 * @summary Check if an account as enough funds to ensure a transfer
 * @param address Public address of the account to check balance for transfer
 * @param value Token amount to transfer
 */
export const checkBalanceForTransfer = async (address: string, value: number | BN) => {
  if (value <= 0) throw new Error("Value needs to be greater than 0")

  const balance = await getBalance(address)
  const amount = typeof value === "number" ? await unFormatBalance(value) : value
  if (balance.cmp(amount) === -1) throw new Error("Insufficient funds to transfer")
}

/**
 * @name transfer
 * @summary Transfer some liquid free balance to another account
 * @param from Public address of the account to get balance for
 * @param to Public address of the account to transfer amount to
 * @param value Token amount to transfer
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction or the hex value of the signable tx
 */
export const transfer = async (
  from: string,
  to: string,
  value: number | BN,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const amount = typeof value === "number" ? await unFormatBalance(value) : value
  await checkBalanceForTransfer(from, amount)
  const hash = await runTx(txPallets.balances, txActions.transfer, [to, amount], keyring, callback)
  return hash
}

/**
 * @name transferAll
 * @summary Transfer the entire transferable balance from the caller account
 * @param to Public address of the account to transfer amount to
 * @param keepAlive Ensure that the transfer does not kill the account, it retains the Existential Deposit
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction or the hex value of the signable tx
 */
export const transferAll = async (
  to: string,
  keepAlive = true,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const hash = await runTx(txPallets.balances, txActions.transferAll, [to, keepAlive], keyring, callback)
  return hash
}

/**
 * @name transferKeepAlive
 * @summary Transfer some liquid free balance to another account with a check that the transfer will not kill the origin account
 * @param from Public address of the account to get balance for
 * @param to Public address of the account to transfer amount to
 * @param value Token amount to transfer
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction or the hex value of the signable tx
 */
export const transferKeepAlive = async (
  from: string,
  to: string,
  value: number | BN,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const amount = typeof value === "number" ? await unFormatBalance(value) : value
  await checkBalanceForTransfer(from, value)
  const hash = await runTx(txPallets.balances, txActions.transferKeepAlive, [to, amount], keyring, callback)
  return hash
}
