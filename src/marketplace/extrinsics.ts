import { IKeyringPair, } from "@polkadot/types/types"
import { MarketplaceCreatedEvent, MarketplaceKindSetEvent, MarketplaceMintFeeSetEvent, MarketplaceOwnerSetEvent, NFTListedEvent, NFTSoldEvent, NFTUnlistedEvent } from "../events"
import { createTxHex, submitTxBlocking, unFormatBalance } from "../blockchain"
import { MarketplaceKind, txActions, txPallets, WaitUntil } from "../constants"
import BN from "bn.js"

// NFTs

/// TODO DOC!
export const createMarketplaceTx = async (
    kind: MarketplaceKind,
) => {
    return await createTxHex(txPallets.marketplace, txActions.createMarketplace, [kind]);
}

/// TODO DOC!
export const createMarketplace = async (
    kind: MarketplaceKind,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await createMarketplaceTx(kind);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(MarketplaceCreatedEvent);
}

/// TODO DOC!
export const setMarketplaceOwnerTx = async (
    id: number,
    recipient: string
) => {
    return await createTxHex(txPallets.marketplace, txActions.setMarketplaceOwner, [id, recipient]);
}

/// TODO DOC!
export const setMarketplaceOwner = async (
    id: number,
    recipient: string,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await setMarketplaceOwnerTx(id, recipient);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(MarketplaceOwnerSetEvent);
}

/// TODO DOC!
export const setMarketplaceKindTx = async (
    id: number,
    kind: MarketplaceKind
) => {
    return await createTxHex(txPallets.marketplace, txActions.setMarketplaceKind, [id, kind]);
}

/// TODO DOC!
export const setMarketplaceKind = async (
    id: number,
    kind: MarketplaceKind,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await setMarketplaceKindTx(id, kind);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(MarketplaceKindSetEvent);
}

/// TODO DOC!
export const listNftTx = async (
    nft_id: number,
    marketplace_id: number,
    price: number | BN
) => {
    let formatted_price = typeof price === "number" ? await unFormatBalance(price) : price;
    return await createTxHex(txPallets.marketplace, txActions.listNft, [nft_id, marketplace_id, formatted_price]);
}

/// TODO DOC!
export const listNft = async (
    nft_id: number,
    marketplace_id: number,
    price: number | BN,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await listNftTx(nft_id, marketplace_id, price);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTListedEvent);
}

/// TODO DOC!
export const unlistNftTx = async (
    nft_id: number,
) => {
    return await createTxHex(txPallets.marketplace, txActions.unlist, [nft_id]);
}

/// TODO DOC!
export const unlistNft = async (
    nft_id: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await unlistNftTx(nft_id);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTUnlistedEvent);
}

/// TODO DOC!
export const buyNftTx = async (
    nft_id: number,
) => {
    return await createTxHex(txPallets.marketplace, txActions.buyNft, [nft_id]);
}

/// TODO DOC!
export const buyNft = async (
    nft_id: number,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await buyNftTx(nft_id);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(NFTSoldEvent);
}

/// TODO DOC!
export const setMarketplaceMintFeeTx = async (
    fee: number | BN,
) => {
    let formatted_price = typeof fee === "number" ? await unFormatBalance(fee) : fee;
    return await createTxHex(txPallets.marketplace, txActions.setMarketplaceMintFee, [fee]);
}

/// TODO DOC!
export const setMarketplaceMintFee = async (
    fee: number | BN,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await setMarketplaceMintFeeTx(fee);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(MarketplaceMintFeeSetEvent);
}