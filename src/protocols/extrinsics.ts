import { IKeyringPair } from "@polkadot/types/types"
import { ConsentAddedEvent, ProtocolRemovedEvent, ProtocolSetEvent, TimerResetEvent } from "../events"

import { createTxHex, submitTxBlocking, TransactionHashType } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import { Protocols, TransmissionCancellation } from "./types"

/**
 * @name setTransmissionProtocolTx
 * @summary    		              Creates an unsigned unsubmittedSet-Transmission-Protocol Transaction Hash.
 * @param nftId		              The NFT Id to add transmission protocol.
 * @param recipient            	The destination account.
 * @param protocol 	            The transmission protocol to execute.
 * @param protocolCancellation 	the cancellation period of the transmission protocol.
 * @returns  		                Unsigned unsubmitted Set-Transmission-Protocol Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const setTransmissionProtocolTx = async (
  nftId: number,
  recipient: string,
  protocol: Protocols,
  protocolCancellation: TransmissionCancellation,
): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.transmissionProtocols, txActions.setTransmissionProtocol, [
    nftId,
    recipient,
    protocol,
    protocolCancellation,
  ])
}

/**
 * @name setTransmissionProtocol
 * @summary    		              Adds a transmission protocol to any type of NFT.
 * @param nftId		              The NFT Id to add transmission protocol.
 * @param recipient            	The destination account.
 * @param protocol 	            The transmission protocol to execute.
 * @param protocolCancellation 	the cancellation period of the transmission protocol.
 * @param keyring               Account that will sign the transaction.
 * @param waitUntil             Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns  		                ProtocolSetEvent Blockchain event.
 */
export const setTransmissionProtocol = async (
  nftId: number,
  recipient: string,
  protocol: Protocols,
  protocolCancellation: TransmissionCancellation,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ProtocolSetEvent> => {
  const tx = await setTransmissionProtocolTx(nftId, recipient, protocol, protocolCancellation)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ProtocolSetEvent)
}

/**
 * @name removeTransmissionProtocolTx
 * @summary    		              Creates an unsigned unsubmitted Remove-Transmission-Protocol Transaction Hash for a tansmission protocol.
 * @param nftId		              The NFT Id to remove the transmission protocol.
 * @returns  		                Unsigned unsubmitted Remove-Transmission-Protocol Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const removeTransmissionProtocolTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.transmissionProtocols, txActions.removeTransmissionProtocol, [nftId])
}

/**
 * @name removeTransmissionProtocol
 * @summary    		                Remove a transmission protocol from an NFT.
 * @param nftId		                The NFT Id to remove the transmission protocol.
 * @param keyring                 Account that will sign the transaction.
 * @param waitUntil               Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns  		                  ProtocolRemovedEvent Blockchain event.
 */
export const removeTransmissionProtocol = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ProtocolRemovedEvent> => {
  const tx = await removeTransmissionProtocolTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ProtocolRemovedEvent)
}

/**
 * @name resetTranmissionProtocolTimerTx
 * @summary    		                Creates an unsigned unsubmitted Reset-Timer Transaction Hash for an AtBlockWithReset protocol.
 * @param nftId		                The NFT Id to reset the timer for an AtBlockWithReset protocol.
 * @param blockNumber 	          The new blockNumber to execute the AtBlockWithReset protocol.
 * @returns  		                  Unsigned unsubmitted Reset-Timer Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const resetTranmissionProtocolTimerTx = async (
  nftId: number,
  blockNumber: number,
): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.transmissionProtocols, txActions.resetTimer, [nftId, blockNumber])
}

/**
 * @name resetTranmissionProtocolTimer
 * @summary    		                Remove a transmission protocol from an NFT.
 * @param nftId		                The NFT Id to remove the transmission protocol.
 * @param blockNumber 	          The new blockNumber to execute the AtBlockWithReset protocol.
 * @param keyring                 Account that will sign the transaction.
 * @param waitUntil               Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns  		                  TimerResetEvent Blockchain event.
 */
export const resetTranmissionProtocolTimer = async (
  nftId: number,
  blockNumber: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<TimerResetEvent> => {
  const tx = await resetTranmissionProtocolTimerTx(nftId, blockNumber)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(TimerResetEvent)
}

/**
 * @name addConsentToOnConsentProtocolTx
 * @summary    		                Creates an unsigned unsubmitted Add-Consent Transaction Hash for an OnConsent protocol.
 * @param nftId		                The NFT Id expecting consent to be added by user.
 * @returns  		                  Unsigned unsubmitted Add-Consent Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const addConsentToOnConsentProtocolTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.transmissionProtocols, txActions.addConsent, [nftId])
}

/**
 * @name addConsentToOnConsentProtocol
 * @summary    		                Adds user consent to transmit the NFT (for users specified in the account list for OnConsent protocol only)
 * @param nftId		                The NFT Id expecting consent to be added by user.
 * @param keyring                 Account that will sign the transaction.
 * @param waitUntil               Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns  		                  ConsentAddedEvent Blockchain event.
 */
export const addConsentToOnConsentProtocol = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ConsentAddedEvent> => {
  const tx = await removeTransmissionProtocolTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ConsentAddedEvent)
}
