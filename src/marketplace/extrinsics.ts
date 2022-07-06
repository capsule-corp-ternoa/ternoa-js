import { IKeyringPair } from "@polkadot/types/types"
import {
  MarketplaceCreatedEvent,
  MarketplaceKindSetEvent,
  MarketplaceMintFeeSetEvent,
  MarketplaceOwnerSetEvent,
  NFTListedEvent,
  NFTSoldEvent,
  NFTUnlistedEvent,
} from "../events"
import { createTxHex, submitTxBlocking, numberToBalance } from "../blockchain"
import { MarketplaceKind, TransactionHash, txActions, txPallets, WaitUntil } from "../constants"
import BN from "bn.js"

/// TODO DOC!
export const createMarketplaceTx = async (kind: MarketplaceKind): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.createMarketplace, [kind])
}

/// TODO DOC!
export const createMarketplace = async (
  kind: MarketplaceKind,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceCreatedEvent> => {
  const tx = await createMarketplaceTx(kind)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceCreatedEvent)
}

/// TODO DOC!
export const setMarketplaceOwnerTx = async (id: number, recipient: string): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceOwner, [id, recipient])
}

/// TODO DOC!
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

/// TODO DOC!
export const setMarketplaceKindTx = async (id: number, kind: MarketplaceKind): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceKind, [id, kind])
}

/// TODO DOC!
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

/// TODO DOC!
export const listNftTx = async (nft_id: number, marketplace_id: number, price: number | BN): Promise<TransactionHash> => {
  const formatted_price = typeof price === "number" ? await numberToBalance(price) : price
  return await createTxHex(txPallets.marketplace, txActions.listNft, [nft_id, marketplace_id, formatted_price])
}

/// TODO DOC!
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

/// TODO DOC!
export const unlistNftTx = async (nft_id: number): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.unlist, [nft_id])
}

/// TODO DOC!
export const unlistNft = async (
  nft_id: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<NFTUnlistedEvent> => {
  const tx = await unlistNftTx(nft_id)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTUnlistedEvent)
}

/// TODO DOC!
export const buyNftTx = async (nft_id: number): Promise<TransactionHash> => {
  return await createTxHex(txPallets.marketplace, txActions.buyNft, [nft_id])
}

/// TODO DOC!
export const buyNft = async (nft_id: number, keyring: IKeyringPair, waitUntil: WaitUntil): Promise<NFTSoldEvent> => {
  const tx = await buyNftTx(nft_id)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(NFTSoldEvent)
}

/// TODO DOC!
export const setMarketplaceMintFeeTx = async (fee: number | BN): Promise<TransactionHash> => {
  const formatted_price = typeof fee === "number" ? await numberToBalance(fee) : fee
  return await createTxHex(txPallets.marketplace, txActions.setMarketplaceMintFee, [formatted_price])
}

/// TODO DOC!
export const setMarketplaceMintFee = async (
  fee: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<MarketplaceMintFeeSetEvent> => {
  const tx = await setMarketplaceMintFeeTx(fee)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(MarketplaceMintFeeSetEvent)
}
