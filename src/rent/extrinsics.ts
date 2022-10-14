import BN from "bn.js"
import { IKeyringPair } from "@polkadot/types/types"

import { AcceptanceType, CancellationFeeType, DurationType, RentFeeType } from "./types"
import { formatRentContractFee } from "./utils"

import { createTxHex, numberToBalance, submitTxBlocking, TransactionHashType } from "../blockchain"
import { txActions, txPallets, WaitUntil } from "../constants"
import {
  ContractCanceledEvent,
  ContractCreatedEvent,
  ContractOfferCreatedEvent,
  ContractOfferRetractedEvent,
  ContractRevokedEvent,
  ContractStartedEvent,
  ContractSubscriptionTermsAcceptedEvent,
  ContractSubscriptionTermsChangedEvent,
} from "../events"

/**
 * @name createContractTx
 * @summary                         Creates an unsigned unsubmitted Create-Rent-Contract Transaction Hash for an NFT.
 * @param nftId                     The NFT Id of the contract.
 * @param duration                  The contract duration : Fixed(EndBlock (a block number)) or Subscription(Period (a block number), MaxDuration (a block number), IsChangeable (a boolean))
 * @param acceptanceType            The type of acceptance: automatic or manuall (with or without whitelist)
 * @param renterCanRevoke           A boolean to allow renter to cancel the contract once started
 * @param rentFee                   The fee to rent the contract: a token amount or an NFT
 * @param renterCancellationFee     The fee to cancel the contract (due by the renter): No Fee (None), FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @param renteeCancellationFee     The fee to cancel the contract (due by the rentee): No Fee (None), FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @returns                         Unsigned unsubmitted Create-Rent-Contract Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createContractTx = async (
  nftId: number,
  duration: DurationType,
  acceptanceType: AcceptanceType,
  renterCanRevoke: boolean,
  rentFee: RentFeeType,
  renterCancellationFee: CancellationFeeType,
  renteeCancellationFee: CancellationFeeType,
): Promise<TransactionHashType> => {
  await formatRentContractFee(rentFee)
  if (renterCancellationFee) await formatRentContractFee(renterCancellationFee)
  if (renteeCancellationFee) await formatRentContractFee(renteeCancellationFee)
  return await createTxHex(txPallets.rent, txActions.createContract, [
    nftId,
    duration,
    acceptanceType,
    renterCanRevoke,
    rentFee,
    renterCancellationFee,
    renteeCancellationFee,
  ])
}

/**
 * @name createContract
 * @summary                         Creates a rental contract on the chain for an NFT.
 * @param nftId                     The NFT Id of the contract.
 * @param duration                  The contract duration : Fixed(EndBlock (a block number)) or Subscription(Period (a block number), MaxDuration (a block number), IsChangeable (a boolean))
 * @param acceptanceType            The type of acceptance: automatic or manuall (with or without whitelist)
 * @param renterCanRevoke           A boolean to allow renter to cancel the contract once started
 * @param rentFee                   The fee to rent the contract: a token amount or an NFT
 * @param renterCancellationFee     The fee to cancel the contract (due by the renter): No Fee (None), FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @param renteeCancellationFee     The fee to cancel the contract (due by the rentee): No Fee (None), FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @param keyring                   Account that will sign the transaction.
 * @param waitUntil                 Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns                         ContractCreatedEvent Blockchain event.
 */
export const createContract = async (
  nftId: number,
  duration: DurationType,
  acceptanceType: AcceptanceType,
  renterCanRevoke: boolean,
  rentFee: RentFeeType,
  renterCancellationFee: CancellationFeeType,
  renteeCancellationFee: CancellationFeeType,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractCreatedEvent> => {
  const tx = await createContractTx(
    nftId,
    duration,
    acceptanceType,
    renterCanRevoke,
    rentFee,
    renterCancellationFee,
    renteeCancellationFee,
  )
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractCreatedEvent)
}

/**
 * @name cancelContractTx
 * @summary               Creates an unsigned unsubmitted Cancel-Rent-Contract Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract to cancel.
 * @returns               Unsigned unsubmitted Cancel-Rent-Contract Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const cancelContractTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.rent, txActions.cancelContract, [nftId])
}

/**
 * @name cancelContract
 * @summary               Cancels a contract that is not running.
 * @param nftId           The NFT Id of the contract to cancel.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractCanceledEvent Blockchain event.
 */
export const cancelContract = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractCanceledEvent> => {
  const tx = await cancelContractTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractCanceledEvent)
}

/**
 * @name revokeContractTx
 * @summary               Creates an unsigned unsubmitted Revoke-Rent-Contract Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract to revoke.
 * @returns               Unsigned unsubmitted Revoke-Rent-Contract Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const revokeContractTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.rent, txActions.revokeContract, [nftId])
}

/**
 * @name revokeContract
 * @summary               Revokes a running contract.
 * @param nftId           The NFT Id of the contract to revoke.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractRevokedEvent Blockchain event.
 */
export const revokeContract = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractRevokedEvent> => {
  const tx = await revokeContractTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractRevokedEvent)
}

/**
 * @name rentTx
 * @summary                Creates an unsigned unsubmitted Rent-Contract Transaction Hash for an NFT.
 * @param  nftId           The NFT Id with the contract to rent.
 * @returns                Unsigned unsubmitted Rent-Contract Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const rentTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.rent, txActions.rent, [nftId])
}

/**
 * @name rent
 * @summary               Rents an nft.
 * @param nftId           The NFT Id of the contract to rent.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractStartedEvent Blockchain event
 */
export const rent = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractStartedEvent> => {
  const tx = await rentTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractStartedEvent)
}

/**
 * @name makeRentOfferTx
 * @summary               Creates an unsigned unsubmitted Make-Rent-Offer Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract to make the offer.
 * @returns               Unsigned unsubmitted Make-Rent-Offer Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const makeRentOfferTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.rent, txActions.makeRentOffer, [nftId])
}

/**
 * @name makeRentOffer
 * @summary               Makes an offer for an available contract.
 * @param nftId           The NFT Id of the contract to make the offer.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractOfferCreated Blockchain event
 */
export const makeRentOffer = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractOfferCreatedEvent> => {
  const tx = await makeRentOfferTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractOfferCreatedEvent)
}

/**
 * @name retractRentOfferTx
 * @summary               Creates an unsigned unsubmitted Retract-Rent-Offer Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract to retract the offer.
 * @returns               Unsigned unsubmitted Retract-Rent-Offer Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const retractRentOfferTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.rent, txActions.retractRentOffer, [nftId])
}

/**
 * @name retractRentOffer
 * @summary               Retracts a rent offer for manual acceptance contract.
 * @param nftId           The NFT Id of the contract to retract the offer.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractOfferRetractedEvent Blockchain event
 */
export const retractRentOffer = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractOfferRetractedEvent> => {
  const tx = await retractRentOfferTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractOfferRetractedEvent)
}

/**
 * @name acceptRentOfferTx
 * @summary               Creates an unsigned unsubmitted Accept-Rent-Offer Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract.
 * @param rentee          The adresse of the rentee who made the offer.
 * @returns               Unsigned unsubmitted Accept-Rent-Offer Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const acceptRentOfferTx = async (nftId: number, rentee: string): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.rent, txActions.acceptRentOffer, [nftId, rentee])
}

/**
 * @name acceptRentOffer
 * @summary               Accepts a rent offer for manual acceptance contract.
 * @param nftId           The NFT Id of the contract to retract the offer.
 * @param rentee          The adresse of the rentee who made the offer.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractStartedEvent Blockchain event
 */
export const acceptRentOffer = async (
  nftId: number,
  rentee: string,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractStartedEvent> => {
  const tx = await acceptRentOfferTx(nftId, rentee)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractStartedEvent)
}

/**
 * @name changeSubscriptionTermsTx
 * @summary               Creates an unsigned unsubmitted Change-Contract-Subscription-Terms Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract to change the subscription terms.
 * @param rentFee         The fee to rent the contract: a token amount
 * @param period          The period of subscription before renewal
 * @param maxDuration     The contract duration (in block). Optional, default is null.
 * @param isChangeable    A boolean to make the contract updatable.
 * @returns               Unsigned unsubmitted Change-Contract-Subscription-Terms Transaction Hash. The Hash is only valid for 5 minutes.
 */

export const changeSubscriptionTermsTx = async (
  nftId: number,
  rentFee: BN | number,
  period: number,
  maxDuration: number | null = null,
  isChangeable: boolean,
): Promise<TransactionHashType> => {
  const formattedFee = typeof rentFee === "number" ? await numberToBalance(rentFee) : rentFee
  return await createTxHex(txPallets.rent, txActions.changeSubscriptionTerms, [
    nftId,
    formattedFee,
    period,
    maxDuration,
    isChangeable,
  ])
}

/**
 * @name changeSubscriptionTerms
 * @summary               Changes the subscription terms for subscription contracts.
 * @param nftId           The NFT Id of the contract to change the subscription terms.
 * @param rentFee         The fee to rent the contract: a token amount
 * @param period          The period of subscription before renewal
 * @param maxDuration     The contract duration (in block). Optional, default is null.
 * @param isChangeable    A boolean to make the contract updatable.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractSubscriptionTermsChangedEvent Blockchain event
 */
export const changeSubscriptionTerms = async (
  nftId: number,
  rentFee: BN | number,
  period: number,
  maxDuration: number | null = null,
  isChangeable: boolean,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractSubscriptionTermsChangedEvent> => {
  const tx = await changeSubscriptionTermsTx(nftId, rentFee, period, maxDuration, isChangeable)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractSubscriptionTermsChangedEvent)
}

/**
 * @name acceptSubscriptionTermsTx
 * @summary               Creates an unsigned unsubmitted Accept-Contract-Subscription-Terms Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract to accept the new subscription terms.
 * @returns               Unsigned unsubmitted Accept-Contract-Subscription-Terms Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const acceptSubscriptionTermsTx = async (nftId: number): Promise<TransactionHashType> => {
  return await createTxHex(txPallets.rent, txActions.acceptSubscriptionTerms, [nftId])
}

/**
 * @name acceptSubscriptionTerms
 * @summary               Accepts the subscription terms for subscription contracts.
 * @param nftId           The NFT Id of the contract to change the subscription terms.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractSubscriptionTermsAcceptedEvent Blockchain event
 */
export const acceptSubscriptionTerms = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractSubscriptionTermsAcceptedEvent> => {
  const tx = await acceptSubscriptionTermsTx(nftId)
  const { events } = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractSubscriptionTermsAcceptedEvent)
}
