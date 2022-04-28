import BN from "bn.js"
import { chainQuery, txActions, txPallets } from "../constants"
import { query, runTx } from "../blockchain"
import { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { getBalance } from "../balance"

/**
 * @name getMarketplaceMintFee
 * @summary Gets the amount of caps needed to mint a marketplace.
 * @returns Marketplace mint fee
 */
export const getMarketplaceMintFee = async () => {
  const fee: any = await query(txPallets.marketplace, chainQuery.marketplaceMintFee)
  return fee as BN
}

/**
 * @name checkBalanceToCreateMarketplace
 * @summary Checks if an account as enough funds to support the marketplace creation fee.
 * @param address Public address of the account to check balance for marketplace creation
 */
export const checkBalanceToCreateMarketplace = async (address: string) => {
  const balance = await getBalance(address)
  const marketPlaceFee = await getMarketplaceMintFee()
  if (balance.cmp(marketPlaceFee) === -1) throw new Error("Insufficient funds to create a marketplace")
}

/**
 * @name checkMarketplaceKind
 * @summary Checks that the kind of a marketplace is set to 'Private' or 'Public'.
 * @param kind kind of marketplace : It must be public or private
 */
export const checkMarketplaceKind = async (kind: string) => {
  if (kind !== ("Public" || "Private"))
    throw new Error("The kind of your marketplace must be set to 'Public' or 'Private'")
}

/**
 * @name createMarketplace
 * @summary Creates a new marketplace on blockchain.
 * @param owner Public address of the account to check balance for marketplace creation
 * @param kind kind of marketplace : It must be public or private
 * @param commissionFee Commission fee of the marketplace ? Est ce que si c'est un nb on doit le changer en BN ?
 * @param name Name of the new marketplace
 * @param uri Uri of the marketplace
 * @param logoUri Uri of the marketplace's logo.
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const createMarketplace = async (
  owner: string,
  kind: "Public" | "Private",
  commissionFee: number | BN,
  name: string,
  uri?: string,
  logoUri?: string,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const kindUppercase = toUpperCase(kind)
  await checkMarketplaceKind(kindUppercase)
  await checkBalanceToCreateMarketplace(owner)
  const tx = await runTx(
    txPallets.marketplace,
    txActions.create,
    [kindUppercase, commissionFee, name, uri, logoUri],
    keyring,
    callback,
  )
  return tx
}

/**
 * @name updateCommissionFee
 * @summary Updates the marketplace commission fee.
 * @param marketplaceId Id of the existing marketplace
 * @param commissionFee Commission fee of the marketplace
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const updateCommissionFee = async (
  marketplaceId: number,
  commissionFee: number | BN,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const tx = await runTx(
    txPallets.marketplace,
    txActions.setCommissionFee,
    [marketplaceId, commissionFee],
    keyring,
    callback,
  )
  return tx
}

/**
 * @name updateOwner
 * @summary Updates the marketplace owner.
 * @param marketplaceId Id of the existing marketplace
 * @param accountId Account address of the new owner
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const updateOwner = async (
  marketplaceId: number,
  accountId: string,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const tx = await runTx(txPallets.marketplace, txActions.setOwner, [marketplaceId, accountId], keyring, callback)
  return tx
}

/**
 * @name updateType
 * @summary Updates the marketplace type/kind : Public or Private.
 * @param marketplaceId Id of the existing marketplace
 * @param kind kind of marketplace : It can be public or private
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const updateType = async (
  marketplaceId: number,
  kind: "Public" | "Private",
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  const kindUppercase = toUpperCase(kind)
  await checkMarketplaceKind(kindUppercase)
  // tester si le kind actuel === nouveau kind ? => handleKind : get marketplace data et comparer avec le kind passé en parametre et throw error
  const tx = await runTx(txPallets.marketplace, txActions.setKind, [marketplaceId, kindUppercase], keyring, callback)
  return tx
}

//updateName

//updateURI

//updateLogoURI

//get

//getAll

/**
 * @name toUpperCase
 * @summary Puts the first letter of a string in uppercase.
 * @param string The word to be checked and changed
 * @returns A string with first letter in upercase
 */
export const toUpperCase = (string: string) => {
  const stringWithUpperCase = string.charAt(0).toUpperCase() + string.slice(1)
  return stringWithUpperCase
}
