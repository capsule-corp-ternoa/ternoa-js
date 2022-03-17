import BN from "bn.js"
import type { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { chainQuery, txActions, txPallets } from "../../constants"
import { unFormatBalance } from "../../utils/blockchain"
import { query, runTx } from "../blockchain"

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
 * @param keyring keyring pair to sign the data
 * @param address public address of the account to get balance for
 * @param value token amount to transfer
 * @returns hash of the transaction
 */
export const transfer = async (
  keyring: IKeyringPair,
  address: string,
  value: number | BN,
  callback?: (result: ISubmittableResult) => void,
) => {
  const amount = typeof value === "number" ? await unFormatBalance(value) : value
  await checkBalanceForTransfer(keyring.address, amount)
  const hash = await runTx(txPallets.balances, txActions.transfer, [address, amount], keyring, callback)
  return hash
}

/**
 * Transfer the entire transferable balance from the caller account
 * @param keyring keyring pair to sign the data
 * @param address public address of the account to get balance for
 * @param keepAlive ensure that the transfer does not kill the account that retains the Existential Deposit
 * @returns hash of the transaction
 */
export const transferAll = async (
  keyring: IKeyringPair,
  address: string,
  keepAlive = true,
  callback?: (result: ISubmittableResult) => void,
) => {
  const hash = await runTx(txPallets.balances, txActions.transferAll, [address, keepAlive], keyring, callback)
  return hash
}

/**
 * Transfer some liquid free balance to another account ensuring to not kill the account
 * @param keyring keyring pair to sign the data
 * @param address public address of the account to get balance for
 * @returns hash of the transaction
 */
export const transferKeepAlive = async (
  keyring: IKeyringPair,
  address: string,
  value: number | BN,
  callback?: (result: ISubmittableResult) => void,
) => {
  const amount = typeof value === "number" ? await unFormatBalance(value) : value
  await checkBalanceForTransfer(keyring.address, value)
  const hash = await runTx(txPallets.balances, txActions.transferKeepAlive, [address, amount], keyring, callback)
  return hash
}
