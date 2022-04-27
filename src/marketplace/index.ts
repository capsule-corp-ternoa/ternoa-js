import BN from "bn.js"
import { chainQuery, txActions, txPallets } from "../constants"
import { query, runTx } from "../blockchain"
import { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { getBalance } from "../balance"

/**
 * @name getMarketplaceMintFee
 * @summary Get the amount of caps needed to mint a marketplace.
 * @returns Marketplace mint fee
 */
export const getMarketplaceMintFee = async () => {
  const fee: any = await query(txPallets.marketplace, chainQuery.marketplaceMintFee)
  return fee as BN
}

/**
 * @name checkBalanceToCreateMarketplace
 * @summary Check if an account as enough funds to support the marketplace creation fee.
 * @param address Public address of the account to check balance for marketplace creation
 */
export const checkBalanceToCreateMarketplace = async (address: string) => {
  const balance = await getBalance(address)
  const marketPlaceFee = await getMarketplaceMintFee()
  if (balance.cmp(marketPlaceFee) === -1) throw new Error("Insufficient funds to create a marketplace")
}

/**
 * @name createMarketplace
 * @summary Creates a new marketplace on blockchain.
 * @param owner Public address of the account to check balance for marketplace creation
 * @param kind kind of marketplace : It can be public or private
 * @param commissionFee Commission fee of the marketplace
 * @param name Name of the new marketplace
 * @param uri Uri of the marketplace
 * @param logoUri Uri of the marketplace's logo.
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Message (About Marketplace created with particular id). // Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const createMarketplace = async (
  owner: string,
  kind: any,
  commissionFee: number | BN,
  name: string,
  uri?: string,
  logoUri?: string,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await checkBalanceToCreateMarketplace(owner)
  const tx = await runTx(
    txPallets.marketplace,
    txActions.create,
    [kind, commissionFee, name, uri, logoUri],
    keyring,
    callback,
  )
  return tx //pas sur de ce qui doit être retourné entre un message et le hash.
}

//updateCommission

//updateOwner

//updateType

//updateName

//updateURI

//updateLogoURI

//get

//getAll
