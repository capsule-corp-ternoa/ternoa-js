import BN from "bn.js"
import { chainQuery, txActions, txPallets } from "../constants"
import { query, runTx } from "../blockchain"
import { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { getBalance } from "../balance"
/**
 * @name toUpperCase
 * @summary Puts the first letter of a word in uppercase.
 * @param string The string to be checked and changed
 * @returns A string with first letter in upercase
 */
export const toUpperCase = (string: string) => {
  const stringWithUpperCase = string.charAt(0).toUpperCase() + string.slice(1)
  return stringWithUpperCase
}

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
 * @param kind Kind of marketplace : It must be public or private
 */
export const checkMarketplaceKind = async (kind: string) => {
  if (kind !== ("Public" || "Private"))
    throw new Error("The kind of the marketplace must be set to 'Public' or 'Private'")
}

/**
 * @name compareDatas
 * @summary Compares the current value of a marketplace attribute to the new one to avoid running a transaction if they are equal.
 * @param marketplaceId Id of the existing marketplace
 * @param marketplaceAttribute Attribute of the marketplace (ex: commission_fee)
 * @param paramValue Value of the marketplace attribute to be compared
 */
export const compareDatas = async (marketplaceId: number, marketplaceAttribute: string, paramValue: any) => {
  const marketplaceDatas: any = await getMarketplaceDatas(marketplaceId)
  marketplaceDatas &&
    paramValue != (null || undefined) &&
    marketplaceDatas[marketplaceAttribute] &&
    marketplaceDatas[marketplaceAttribute] === paramValue
  throw new Error(`The ${marketplaceAttribute.replace(/_/g, " ")} of the marketplace is already set to : ${paramValue}`)
}

/**
 * @name createMarketplace
 * @summary Creates a new marketplace on blockchain.
 * @param owner Public address of the account to check balance for marketplace creation
 * @param kind Kind of marketplace : It must be public or private
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
 * @name getMarketplaceDatas
 * @summary Gets all the datas from a marketplace.
 * @param marketplaceId The marketplace id
 * @returns A JSON object with all the marketplace datas ex:{Public, commission_fee, owner, (...)}
 */
export const getMarketplaceDatas = async (marketplaceId: number) => {
  const marketplaceDatas = await query(txPallets.marketplace, chainQuery.marketplaces, [marketplaceId])
  return marketplaceDatas //.toJSON() : To Be Confirmed if we retrun it with toJSON or not
}

/**
 * @name getAllMarketplacesDatas
 * @summary Gets all the datas from all the existings marketplaces.
 * @returns A JSON array of object with all the existings marketplaces datas
 */
export const getAllMarketplacesDatas = async () => {
  const marketplacesDatas = await query(txPallets.marketplace, chainQuery.marketplaces)
  return marketplacesDatas //.toJSON() : To Be Confirmed if we retrun it with toJSON or not
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
  await compareDatas(marketplaceId, "commission_fee", commissionFee)
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
  await compareDatas(marketplaceId, "owner", accountId)
  const tx = await runTx(txPallets.marketplace, txActions.setOwner, [marketplaceId, accountId], keyring, callback)
  return tx
}

/**
 * @name updateType
 * @summary Updates the marketplace kind : Public or Private.
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
  await compareDatas(marketplaceId, "kind", kindUppercase)
  const tx = await runTx(txPallets.marketplace, txActions.setKind, [marketplaceId, kindUppercase], keyring, callback)
  return tx
}

/**
 * @name updateName
 * @summary Updates the marketplace name.
 * @param marketplaceId Id of the existing marketplace
 * @param name New name of the marketplace    // Warning pourquoi possible de télécharger un fichier ? Et ex commence par 0X ?
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const updateName = async (
  marketplaceId: number,
  name: string,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await compareDatas(marketplaceId, "name", name)
  const tx = await runTx(txPallets.marketplace, txActions.setName, [marketplaceId, name], keyring, callback)
  return tx
}

/**
 * @name updateUri
 * @summary Updates the marketplace uri.
 * @param marketplaceId Id of the existing marketplace
 * @param uri New uri of the marketplace
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const updateUri = async (
  marketplaceId: number,
  uri: string,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await compareDatas(marketplaceId, "uri", uri)
  const tx = await runTx(txPallets.marketplace, txActions.setUri, [marketplaceId, uri], keyring, callback)
  return tx
}

/**
 * @name updateLogoUri
 * @summary Updates the marketplace logo uri.
 * @param marketplaceId Id of the existing marketplace
 * @param logoUri New logo uri of the marketplace
 * @param keyring Keyring pair to sign the data
 * @param callback Callback function to enable subscription, if not given, no subscription will be made
 * @returns Hash of the transaction, or an unsigned transaction to be signed if no keyring pair is passed
 */
export const updateLogoUri = async (
  marketplaceId: number,
  logoUri: string,
  keyring?: IKeyringPair,
  callback?: (result: ISubmittableResult) => void,
) => {
  await compareDatas(marketplaceId, "logo_uri", logoUri)
  const tx = await runTx(txPallets.marketplace, txActions.setLogoUri, [marketplaceId, logoUri], keyring, callback)
  return tx
}
