import BN from "bn.js"
import type { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { chainQuery, txActions, txPallets } from "../constants"
import { query, runTx, unFormatBalance } from "../blockchain"

/**
 * Get the balance of an account
 * @param address public address of the account to get balance for
 * @returns the free balance of the address
 */
export const getBalance = async (address: string) => {
  const balance: { free: BN } = ((await query(txPallets.system, chainQuery.account, [address])) as any).data
  return balance.free
}

/**
 * Check if an account as enough funds to ensure a transfer
 * @param address public address of the account to check balance for transfer
 * @param value token amount to transfer
 */
export const checkBalanceForTransfer = async (address: string, value: number | BN) => {
  if (value <= 0) throw new Error("Value needs to be greater than 0")

  const balance = await getBalance(address)
  const amount = typeof value === "number" ? await unFormatBalance(value) : value
  if (balance.cmp(amount) === -1) throw new Error("Insufficient funds to transfer")
}

/**
 * Transfer some liquid free balance to another account
 * @param from public address of the account to get balance for
 * @param to public address of the account to transfer amount to
 * @param value token amount to transfer
 * @param keyring keyring pair to sign the data
 * @param callback callback function to enable subscription, if not given, no subscription will be made
 * @returns hash of the transaction or the hex value of the signed tx to be used again elsewhere
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
 * Transfer the entire transferable balance from the caller account
 * @param to public address of the account to transfer amount to
 * @param keepAlive ensure that the transfer does not kill the account that retains the Existential Deposit
 * @param keyring keyring pair to sign the data
 * @param callback callback function to enable subscription, if not given, no subscription will be made
 * @returns hash of the transaction or the hex value of the signed tx to be used again elsewhere
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
 * Transfer some liquid free balance to another account ensuring to not kill the account
 * @param from public address of the account to get balance for
 * @param to public address of the account to transfer amount to
 * @param value token amount to transfer
 * @param keyring keyring pair to sign the data
 * @param callback callback function to enable subscription, if not given, no subscription will be made
 * @returns hash of the transaction or the hex value of the signed tx to be used again elsewhere
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
