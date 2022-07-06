import BN from "bn.js"
import type { IKeyringPair, ISubmittableResult } from "@polkadot/types/types"
import { txActions, txPallets, WaitUntil } from "../constants"
import { createTxHex, submitTxBlocking, unFormatBalance } from "../blockchain"
import { BalancesTransferEvent } from "../events"


/// TODO DOC!
export const balancesTransferTx = async (
    to: string,
    value: number | BN,
) => {
    const amount = typeof value === "number" ? await unFormatBalance(value) : value
    return await createTxHex(txPallets.balances, txActions.transfer, [to, amount]);
}

/// TODO DOC!
export const balancesTransfer = async (
    to: string,
    value: number | BN,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await balancesTransferTx(to, value);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(BalancesTransferEvent);
}


/// TODO DOC!
export const balancesTransferAllTx = async (
    to: string,
    keepAlive = true,
) => {
    return await createTxHex(txPallets.balances, txActions.transferAll, [to, keepAlive]);
}

/// TODO DOC!
export const balancesTransferAll = async (
    to: string,
    keepAlive = true,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await balancesTransferAllTx(to, keepAlive);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(BalancesTransferEvent);
}

export const balancesTransferKeepAliveTx = async (
    to: string,
    value: number | BN,
) => {
    const amount = typeof value === "number" ? await unFormatBalance(value) : value;
    return await createTxHex(txPallets.balances, txActions.transferKeepAlive, [to, amount]);
}

export const balancesTransferKeepAlive = async (
    to: string,
    value: number | BN,
    keyring: IKeyringPair,
    waitUntil: WaitUntil,
) => {
    const tx = await balancesTransferKeepAliveTx(to, value);
    const events = await submitTxBlocking(tx, waitUntil, keyring);
    return events.findEventOrThrow(BalancesTransferEvent);
}
