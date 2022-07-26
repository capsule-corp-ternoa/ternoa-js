import { IKeyringPair } from "@polkadot/types/types"
import {
  MarketplaceCreatedEvent,
  MarketplaceConfigSetEvent,
  MarketplaceKindSetEvent,
  MarketplaceMintFeeSetEvent,
  MarketplaceOwnerSetEvent,
  NFTListedEvent,
  NFTSoldEvent,
  NFTUnlistedEvent,
} from "../events"
import { createTxHex, submitTxBlocking, numberToBalance } from "../blockchain"
import {
  MarketplaceConfigAction,
  MarketplaceKind,
  TransactionHash,
  txActions,
  txPallets,
  WaitUntil,
} from "../constants"
import { AccountListType, CommissionFeeType, ListingFeeType, OffchainDataType } from "./interfaces"
import BN from "bn.js"
import { formatMarketplaceFee } from "./utils"

/**
 * @name createMarketplaceTx
 * @summary               Creates an unsigned unsubmitted Create-Marketplace Transaction Hash.
 * @param kind            Kind of marketplace : It must be public or private.
 * @returns               Unsigned unsubmitted Create-Marketplace Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createMarketplaceTx = async (kind: MarketplaceKind): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.createMarketplace, [kind])
}

/**
 * @name createMarketplace
 * @summary               Creates a Marketplace on the chain.
 * @param kind            Kind of marketplace : It must be public or private.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               MarketplaceCreatedEvent Blockchain event.
 */
export const createMarketplace = async (
  kind: MarketplaceKind,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceCreatedEvent> => {
  const tx = await createMarketplaceTx(kind)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceCreatedEvent)
}

/**
 * @name setMarketplaceConfigurationTx
 * @summary               Creates an unsigned unsubmitted Create-Marketplace-Configuration Transaction Hash.
 * @param commissionFee   Commission when an NFT is sold on the marketplace : it can be set as flat (number) or as percentage.
 * @param listingFee      Fee when an NFT is added for sale to marketplace : it can be set as flat (number) or as percentage.
 * @param accountList     A list of accounts : if the marketplace kind is private, it allows these accounts to sell NFT. If the marketplace kind is public, it bans these accounts from selling NFT.
 * @param offchainData    Off-chain related NFT metadata. Can be an IPFS Hash, an URL or plain text.
 * @returns               Unsigned unsubmitted Create-Marketplace-Configuration Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setMarketplaceConfigurationTx = async (
  id: number,
  commissionFee: CommissionFeeType = MarketplaceConfigAction.Noop,
  listingFee: ListingFeeType = MarketplaceConfigAction.Noop,
  accountList: AccountListType = MarketplaceConfigAction.Noop,
  offchainData: OffchainDataType = MarketplaceConfigAction.Noop,
): Promise<TransactionHash> => {
  await formatMarketplaceFee(commissionFee)
  await formatMarketplaceFee(listingFee)
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceConfiguration, [
    id,
    commissionFee,
    listingFee,
    accountList,
    offchainData,
  ])
}

/**
 * @name setMarketplaceConfiguration
 * @summary               Set or Remove the four marketplace parameters configuration : Commission fee, listing fee, the account list or any offchain datas.
 *
 * Each of the four parameters of the marketplace, need on of the type below as below :
 * Noop :     No Operation, nothing change.
 * Removed :  Current datas will be deleted.
 * Set :      To add new value: Commission Fee and Listing Fee require to precise their type : flat or percentage.
 *
 * @param commissionFee   Commission when an NFT is sold on the marketplace : it can be set as flat (number) or as percentage.
 * @param listingFee      Fee when an NFT is added for sale to marketplace : it can be set as flat (number) or as percentage.
 * @param accountList     A list of accounts : if the marketplace kind is private, it allows these accounts to sell NFT. If the marketplace kind is public, it bans these accounts from selling NFT.
 * @param offchainData    Off-chain related NFT metadata. Can be an IPFS Hash, an URL or plain text.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               MarketplaceConfigSetEvent Blockchain event.
 */
export const setMarketplaceConfiguration = async (
  id: number,
  commissionFee: CommissionFeeType = MarketplaceConfigAction.Noop,
  listingFee: ListingFeeType = MarketplaceConfigAction.Noop,
  accountList: AccountListType = MarketplaceConfigAction.Noop,
  offchainData: OffchainDataType = MarketplaceConfigAction.Noop,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceConfigSetEvent> => {
  const tx = await setMarketplaceConfigurationTx(id, commissionFee, listingFee, accountList, offchainData)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceConfigSetEvent)
}

/**
 * @name setMarketplaceOwnerTx
 * @summary               Creates an unsigned unsubmitted Set-Marketplace-Owner Transaction Hash.
 * @param id              Marketplace Id of the marketplace to be transferred.
 * @param recipient       Adress of the new marketplace owner.
 * @returns               Unsigned unsubmitted Set-Marketplace-Owner Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setMarketplaceOwnerTx = async (id: number, recipient: string): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceOwner, [id, recipient])
}

/**
 * @name setMarketplaceOwner
 * @summary               Set the new marketplace owner on the chain.
 * @param id              Marketplace Id of the marketplace to be transferred.
 * @param recipient       Adress of the new marketplace owner.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               MarketplaceOwnerSetEvent Blockchain event.
 */
export const setMarketplaceOwner = async (
  id: number,
  recipient: string,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceOwnerSetEvent> => {
  const tx = await setMarketplaceOwnerTx(id, recipient)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceOwnerSetEvent)
}

/**
 * @name setMarketplaceKindTx
 * @summary               Creates an unsigned unsubmitted Set-Marketplace-Kind Transaction Hash.
 * @param kind            Kind of marketplace : It must be public or private.
 * @returns               Unsigned unsubmitted Set-Marketplace-Kind Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setMarketplaceKindTx = async (id: number, kind: MarketplaceKind): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceKind, [id, kind])
}

/**
 * @name setMarketplaceKind
 * @summary               Set the new marketplace kind on the chain.
 * @param kind            Kind of marketplace : It must be public or private.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               MarketplaceKindSetEvent Blockchain event.
 */
export const setMarketplaceKind = async (
  id: number,
  kind: MarketplaceKind,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceKindSetEvent> => {
  const tx = await setMarketplaceKindTx(id, kind)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceKindSetEvent)
}

/**
 * @name listNftTx
 * @summary               Creates an unsigned unsubmitted List-NFT Transaction Hash.
 * @param nft_id          NFT Id of the NFT to be listed for sale.
 * @param marketplace_id  Marketplace Id of the marketplace to list the NFT on.
 * @param price           Price of the NFT.
 * @returns               Unsigned unsubmitted List-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const listNftTx = async (
  nft_id: number,
  marketplace_id: number,
  price: number | BN,
): Promise<TransactionHash> => {
  const formatted_price = typeof price === "number" ? await numberToBalance(price) : price
  return await createTxHex(txPallets.marketplace, txActions.listNft, [nft_id, marketplace_id, formatted_price])
}

/**
 * @name listNft
 * @summary               Lists an NFT on a marketplace.
 * @param nft_id          NFT Id of the NFT to be listed for sale.
 * @param marketplace_id  Marketplace Id of the marketplace to list the NFT on.
 * @param price           Price of the NFT.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTListedEvent Blockchain event.
 */
export const listNft = async (
  nft_id: number,
  marketplace_id: number,
  price: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTListedEvent> => {
  const tx = await listNftTx(nft_id, marketplace_id, price)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTListedEvent)
}

/**
 * @name unlistNftTx
 * @summary               Creates an unsigned unsubmitted Unlist-NFT Transaction Hash.
 * @param nft_id          NFT Id of the NFT to be unlisted from sale.
 * @returns               Unsigned unsubmitted Unlist-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const unlistNftTx = async (nft_id: number): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.unlistNft, [nft_id])
}

/**
 * @name unlistNft
 * @summary               Unlists an NFT from a marketplace.
 * @param nft_id          NFT Id of the NFT to be unlisted from sale.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTUnlistedEvent Blockchain event.
 */
export const unlistNft = async (
  nft_id: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTUnlistedEvent> => {
  const tx = await unlistNftTx(nft_id)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTUnlistedEvent)
}

/**
 * @name buyNftTx
 * @summary               Creates an unsigned unsubmitted Buy-NFT Transaction Hash.
 * @param nft_id          NFT Id of the NFT for sale.
 * @returns               Unsigned unsubmitted Buy-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const buyNftTx = async (nft_id: number): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.buyNft, [nft_id])
}

/**
 * @name buyNft
 * @summary               Buys an NFT on a marketplace.
 * @param nft_id          NFT Id of the NFT for sale.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTSoldEvent Blockchain event.
 */
export const buyNft = async (nft_id: number, keyring: IKeyringPair, waitUntil: WaitUntil): Promise<NFTSoldEvent> => {
  const tx = await buyNftTx(nft_id)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTSoldEvent)
}

/**
 * @name setMarketplaceMintFeeTx
 * @summary               Creates an unsigned unsubmitted Set-Marketplace-Mint-Fee Transaction Hash.
 * @param fee             Fee to mint a marketplace.
 * @returns               Unsigned unsubmitted Set-Marketplace-Mint-Fee Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setMarketplaceMintFeeTx = async (fee: number | BN): Promise<TransactionHash> => {
  const formatted_price = typeof fee === "number" ? await numberToBalance(fee) : fee
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceMintFee, [formatted_price])
}

/**
 * @name setMarketplaceMintFee
 * @summary               Set the new marketplace minting fee on the chain.
 * @param fee             Fee to mint a marketplace.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTSoldEvent Blockchain event.
 */
export const setMarketplaceMintFee = async (
  fee: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceMintFeeSetEvent> => {
  const tx = await setMarketplaceMintFeeTx(fee)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceMintFeeSetEvent)
}
