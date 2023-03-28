import BN from "bn.js"
import { IKeyringPair } from "@polkadot/types/types"

import { createTxHex, submitTxBlocking, numberToBalance, TransactionHashType } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
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

import { MarketplaceConfigAction, MarketplaceKind } from "./enum"
import { AccountListType, CollectionListType, CommissionFeeType, ListingFeeType, OffchainDataType } from "./types"

/**
 * @name createMarketplaceTx
 * @summary               Creates an unsigned unsubmitted Create-Marketplace Transaction Hash.
 * @param kind            Kind of marketplace : It must be public or private.
 * @returns               Unsigned unsubmitted Create-Marketplace Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createMarketplaceTx = async (kind: MarketplaceKind): Promise<TransactionHashType> => {
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
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceCreatedEvent)
}

/**
 * @name setMarketplaceConfigurationTx
 * @summary               Creates an unsigned unsubmitted Set-Marketplace-Configuration Transaction Hash.
 *
 *                        Each of the parameters of the marketplace, need one of the following type: Noop is set by default for each of the parameters.
 *                        - Noop: No Operation, nothing change.
 *                        - Remove: Current datas will be deleted.
 *                        - Set: An object that updates parameter value below.
 *                            - Commission Fee and Listing Fee require a data type (flat or percentage) under format : { [MarketplaceConfigAction.Set]: { setFeeType: number || BN}}
 *                            - AccountList require an array of string: { [MarketplaceConfigAction.Set]: string[]}
 *                            - OffChainData require a string: { [MarketplaceConfigAction.Set]: string}
 *                            - CollectionList require an arry of number: { [MarketplaceConfigAction.Set]: number[]}
 *
 *                        IMPORTANT: In order to avoid any error, we strongly recommand you to construct those fields using the helpers we provide.
 *                        - formatMarketplaceFee() for both commission and listing fee.
 *                        - formatMarketplaceAccountList() for the account list.
 *                        - formatMarketplaceOffchainData() for the offchain data.
 *                        - formatMarketplaceCollectionList() for the collection list.
 *                        - Check {@link https://docs.ternoa.network/for-developers/guides/marketplace/ Ternoa Doc}.
 *
 * @param id              Marketplace Id of the marketplace to update.
 * @param commissionFee   Commission when an NFT is sold on the marketplace : it can be set as flat (in Big Number format) or as percentage (in permill format). Without using formatters, you can use the convertMarketplaceFee() function.
 * @param listingFee      Fee when an NFT is added for sale to marketplace : it can be set as flat (in Big Number format) or as percentage (in permill format). Without using formatters, you can use the convertMarketplaceFee() function.
 * @param accountList     A list of accounts : if the marketplace kind is private, it allows these accounts to sell NFT. If the marketplace kind is public, it bans these accounts from selling NFT.
 * @param offchainData    Off-chain related marketplace metadata. Can be an IPFS Hash, an URL or plain text.
 * @param collectionList  A list of Collection Id: same as accountList, if the marketplace kind is private, the list is a whitelist and if the marketplace is public, the list bans the collection to be listed.
 * @returns               MarketplaceConfigSetEvent Blockchain event.
 */
export const setMarketplaceConfigurationTx = async (
  id: number,
  commissionFee: CommissionFeeType = MarketplaceConfigAction.Noop,
  listingFee: ListingFeeType = MarketplaceConfigAction.Noop,
  accountList: AccountListType = MarketplaceConfigAction.Noop,
  offchainData: OffchainDataType = MarketplaceConfigAction.Noop,
  collectionList: CollectionListType = MarketplaceConfigAction.Noop,
): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceConfiguration, [
    id,
    commissionFee,
    listingFee,
    accountList,
    offchainData,
    collectionList,
  ])
}

/**
 * @name setMarketplaceConfiguration
 * @summary               Set or Remove (Noop for No Operation) the marketplace parameters configuration : Commission fee, listing fee, the account list or any offchain datas.
 *
 *                        Each of the parameters of the marketplace, need one of the following type: Noop is set by default for each of the parameters.
 *                        - Noop: No Operation, nothing change.
 *                        - Remove: Current datas will be deleted.
 *                        - Set: An object that updates parameter value below.
 *                            - Commission Fee and Listing Fee require a data type (flat or percentage) under format : { [MarketplaceConfigAction.Set]: { setFeeType: number || BN}}
 *                            - AccountList require an array of string: { [MarketplaceConfigAction.Set]: string[]}
 *                            - OffChainData require a string: { [MarketplaceConfigAction.Set]: string}
 *                            - CollectionList require an arry of number: { [MarketplaceConfigAction.Set]: number[]}
 *
 *                        IMPORTANT: In order to avoid any error, we strongly recommand you to construct those fields using the helpers we provide.
 *                        - formatMarketplaceFee() for both commission and listing fee.
 *                        - formatMarketplaceAccountList() for the account list.
 *                        - formatMarketplaceOffchainData() for the offchain data.
 *                        - formatMarketplaceCollectionList() for the collection list.
 *                        - Check {@link https://docs.ternoa.network/for-developers/guides/marketplace/ Ternoa Doc}.
 *
 * @param id              Marketplace Id of the marketplace to update.
 * @param commissionFee   Commission when an NFT is sold on the marketplace : it can be set as flat (in Big Number format) or as percentage (in permill format). Without using formatters, you can use the convertMarketplaceFee() function.
 * @param listingFee      Fee when an NFT is added for sale to marketplace : it can be set as flat (in Big Number format) or as percentage (in permill format). Without using formatters, you can use the convertMarketplaceFee() function.
 * @param accountList     A list of accounts : if the marketplace kind is private, it allows these accounts to sell NFT. If the marketplace kind is public, it bans these accounts from selling NFT.
 * @param offchainData    Off-chain related marketplace metadata. Can be an IPFS Hash, an URL or plain text.
 * @param collectionList  A list of Collection Id: same as accountList, if the marketplace kind is private, the list is a whitelist and if the marketplace is public, the list bans the collection to be listed.
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
  collectionList: CollectionListType = MarketplaceConfigAction.Noop,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceConfigSetEvent> => {
  const tx = await setMarketplaceConfigurationTx(
    id,
    commissionFee,
    listingFee,
    accountList,
    offchainData,
    collectionList,
  )
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceConfigSetEvent)
}

/**
 * @name setMarketplaceOwnerTx
 * @summary               Creates an unsigned unsubmitted Set-Marketplace-Owner Transaction Hash.
 * @param id              Marketplace Id of the marketplace to be transferred.
 * @param recipient       Adress of the new marketplace owner.
 * @returns               Unsigned unsubmitted Set-Marketplace-Owner Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setMarketplaceOwnerTx = async (id: number, recipient: string): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceOwner, [id, recipient])
}

/**
 * @name setMarketplaceOwner
 * @summary               Set the new marketplace owner on the chain.
 * @param id              Marketplace Id of the marketplace to be transferred.
 * @param recipient       Address of the new marketplace owner.
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
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceOwnerSetEvent)
}

/**
 * @name setMarketplaceKindTx
 * @summary               Creates an unsigned unsubmitted Set-Marketplace-Kind Transaction Hash.
 * @param kind            Kind of marketplace : It must be public or private.
 * @returns               Unsigned unsubmitted Set-Marketplace-Kind Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setMarketplaceKindTx = async (id: number, kind: MarketplaceKind): Promise<TransactionHashType> => {
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
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceKindSetEvent)
}

/**
 * @name listNftTx
 * @summary               Creates an unsigned unsubmitted List-NFT Transaction Hash.
 * @param nftId           NFT Id of the NFT to be listed for sale.
 * @param marketplaceId   Marketplace Id of the marketplace to list the NFT on.
 * @param price           Price of the NFT.
 * @returns               Unsigned unsubmitted List-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const listNftTx = async (
  nftId: number,
  marketplaceId: number,
  price: number | BN,
): Promise<TransactionHashType> => {
  const formattedPrice = typeof price === "number" ? numberToBalance(price) : price
  return await createTxHex(txPallets.marketplace, txActions.listNft, [nftId, marketplaceId, formattedPrice])
}

/**
 * @name listNft
 * @summary               Lists an NFT on a marketplace.
 * @param nftId           NFT Id of the NFT to be listed for sale.
 * @param marketplaceId   Marketplace Id of the marketplace to list the NFT on.
 * @param price           Price of the NFT.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTListedEvent Blockchain event.
 */
export const listNft = async (
  nftId: number,
  marketplaceId: number,
  price: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTListedEvent> => {
  const tx = await listNftTx(nftId, marketplaceId, price)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTListedEvent)
}

/**
 * @name unlistNftTx
 * @summary               Creates an unsigned unsubmitted Unlist-NFT Transaction Hash.
 * @param nftId           NFT Id of the NFT to be unlisted from sale.
 * @returns               Unsigned unsubmitted Unlist-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const unlistNftTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.marketplace, txActions.unlistNft, [nftId])
}

/**
 * @name unlistNft
 * @summary               Unlists an NFT from a marketplace.
 * @param nftId           NFT Id of the NFT to be unlisted from sale.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTUnlistedEvent Blockchain event.
 */
export const unlistNft = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTUnlistedEvent> => {
  const tx = await unlistNftTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTUnlistedEvent)
}

/**
 * @name buyNftTx
 * @summary               Creates an unsigned unsubmitted Buy-NFT Transaction Hash.
 * @param nftId           NFT Id of the NFT for sale.
 * @param signedPrice     The signed buy price.
 * @returns               Unsigned unsubmitted Buy-NFT Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const buyNftTx = async (nftId: number, signedPrice: number | BN): Promise<TransactionHashType> => {
  const formattedSignedPrice = typeof signedPrice === "number" ? numberToBalance(signedPrice) : signedPrice
  return await createTxHex(txPallets.marketplace, txActions.buyNft, [nftId, formattedSignedPrice])
}

/**
 * @name buyNft
 * @summary               Buys an NFT on a marketplace.
 * @param nftId           NFT Id of the NFT for sale.
 * @param signedPrice     The signed buy price.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               NFTSoldEvent Blockchain event.
 */
export const buyNft = async (
  nftId: number,
  signedPrice: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTSoldEvent> => {
  const tx = await buyNftTx(nftId, signedPrice)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTSoldEvent)
}

/**
 * @name setMarketplaceMintFeeTx
 * @summary               Creates an unsigned unsubmitted Set-Marketplace-Mint-Fee Transaction Hash.
 * @param fee             Fee to mint a marketplace.
 * @returns               Unsigned unsubmitted Set-Marketplace-Mint-Fee Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setMarketplaceMintFeeTx = async (fee: number | BN): Promise<TransactionHashType> => {
  const formattedPrice = typeof fee === "number" ? numberToBalance(fee) : fee
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceMintFee, [formattedPrice])
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
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceMintFeeSetEvent)
}
