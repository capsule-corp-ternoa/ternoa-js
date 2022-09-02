import BN from "bn.js"
import { IKeyringPair } from "@polkadot/types/types"

import { AcceptanceType, CancellationFeeType, DurationType, RentFeeType, RevocationType } from "./types"
import { formatRentContractFee } from "./utils"
import { getRentalContractData } from "./storage"

import { createTxHex, numberToBalance, submitTxBlocking, TransactionHashType } from "../blockchain"
import { Errors, txActions, txPallets, WaitUntil } from "../constants"
import {
  ContractCreatedEvent,
  ContractOfferCreatedEvent,
  ContractOfferRetractedEvent,
  ContractRevokedEvent,
  ContractStartedEvent,
  ContractSubscriptionTermsAcceptedEvent,
  ContractSubscriptionTermsChangedEvent,
} from "../events"
import { AcceptanceAction } from "./enum"
/**
 * @name createContractTx
 * @summary                         Creates an unsigned unsubmitted Create-Rent-Contract Transaction Hash for an NFT.
 * @param nftId                     The NFT Id of the contract.
 * @param duration                  The contract duration : Fixed, Subscription or Infinite
 * @param acceptanceType            The type of acceptance: automatic or manuall
 * @param revocationType            The type/periode of revocation: NoRevocation, OnSubscriptionChange, Anytime
 * @param rentFee                   The fee to rent the contract: a token amount or an NFT
 * @param renterCancellationFee     The fee to cancel the contract (due by the renter): FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @param renteeCancellationFee     The fee to cancel the contract (due by the rentee): FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @returns                         Unsigned unsubmitted Create-Rent-Contract Transaction Hash. The Hash is only valid for 5 minutes.
 */
export const createContractTx = async (
  nftId: number,
  duration: DurationType,
  acceptanceType: AcceptanceType,
  revocationType: RevocationType,
  rentFee: RentFeeType,
  renterCancellationFee: CancellationFeeType | null = null,
  renteeCancellationFee: CancellationFeeType | null = null,
): Promise<TransactionHashType> => {
  //blocks value in duration must be converted in date ??
  // await formatRentContractFee(rentFee)
  // await formatRentContractFee(renterCancellationFee)
  // await formatRentContractFee(renteeCancellationFee)
  return await createTxHex(txPallets.rent, txActions.createContract, [
    nftId,
    duration,
    acceptanceType,
    revocationType,
    rentFee,
    renterCancellationFee,
    renteeCancellationFee,
  ])
}

/**
 * @name createContract
 * @summary                         Creates a rental contract on the chain for an NFT.
 * @param nftId                     The NFT Id of the contract.
 * @param duration                  The contract duration : Fixed, Subscription or Infinite
 * @param acceptanceType            The type of acceptance: automatic or manuall
 * @param revocationType            The type/periode of revocation: NoRevocation, OnSubscriptionChange, Anytime
 * @param rentFee                   The fee to rent the contract: a token amount or an NFT
 * @param renterCancellationFee     The fee to cancel the contract (due by the renter): FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @param renteeCancellationFee     The fee to cancel the contract (due by the rentee): FixedTokens amount, FlexibleTokens (only for Fixed contract) amount or an NFT
 * @param keyring                   Account that will sign the transaction.
 * @param waitUntil                 Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns                         ContractCreatedEvent Blockchain event.
 */
export const createContract = async (
  nftId: number,
  duration: DurationType,
  acceptanceType: AcceptanceType,
  revocationType: RevocationType,
  rentFee: RentFeeType,
  renterCancellationFee: CancellationFeeType | null = null,
  renteeCancellationFee: CancellationFeeType | null = null,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractCreatedEvent> => {
  const tx = await createContractTx(
    nftId,
    duration,
    acceptanceType,
    revocationType,
    rentFee,
    renterCancellationFee,
    renteeCancellationFee,
  )
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractCreatedEvent)
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
 * @summary               Revoke a rent contract, cancel it if it has not started.
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
  const events = await submitTxBlocking(tx, waitUntil, keyring)
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
 * @summary               Rent an nft if contract exist, makes an offer if contract acceptance is manual acceptance.
 * @param nftId           The NFT Id of the contract to rent.
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractStartedEvent Blockchain event
 */
export const rent = async (
  nftId: number,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractStartedEvent | ContractOfferCreatedEvent> => {
  const getData = await getRentalContractData(nftId)
  if (getData === null) {
    throw new Error(Errors.RENT_CONTRACT_NOT_FOUND)
  }
  const isAutoAcceptance = getData?.acceptanceType === AcceptanceAction.AutoAcceptance
  const tx = await rentTx(nftId)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(isAutoAcceptance ? ContractStartedEvent : ContractOfferCreatedEvent)
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
 * @summary               Retract a rent offer for manual acceptance contract.
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
  const events = await submitTxBlocking(tx, waitUntil, keyring)
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
 * @summary               Accept a rent offer for manual acceptance contract.
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
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractStartedEvent)
}

/**
 * @name changeSubscriptionTermsTx
 * @summary               Creates an unsigned unsubmitted Change-Contract-Subscription-Terms Transaction Hash for an NFT.
 * @param nftId           The NFT Id of the contract to change the subscription terms.
 * @param duration        The contract duration : Fixed, Subscription or Infinite
 * @param amount          The fee to rent the contract: a token amount
 * @returns               Unsigned unsubmitted Change-Contract-Subscription-Terms Transaction Hash. The Hash is only valid for 5 minutes.
 */

export const changeSubscriptionTermsTx = async (
  nftId: number,
  duration: DurationType,
  amount: number | BN,
): Promise<TransactionHashType> => {
  //blocks value in duration must be converted in blocks ??
  typeof amount === "number" && (await numberToBalance(amount))
  return await createTxHex(txPallets.rent, txActions.changeSubscriptionTerms, [nftId, duration, amount])
}

/**
 * @name changeSubscriptionTerms
 * @summary               Change the subscription terms for subscription contracts.
 * @param nftId           The NFT Id of the contract to change the subscription terms.
 * @param duration        The contract duration : Fixed, Subscription or Infinite
 * @param amount          The fee to rent the contract: a token amount
 * @param keyring         Account that will sign the transaction.
 * @param waitUntil       Execution trigger that can be set either to BlockInclusion or BlockFinalization.
 * @returns               ContractSubscriptionTermsChangedEvent Blockchain event
 */
export const changeSubscriptionTerms = async (
  nftId: number,
  duration: DurationType,
  amount: number | BN,
  keyring: IKeyringPair,
  waitUntil: WaitUntil,
): Promise<ContractSubscriptionTermsChangedEvent> => {
  const tx = await changeSubscriptionTermsTx(nftId, duration, amount)
  const events = await submitTxBlocking(tx, waitUntil, keyring)
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
 * @summary               Change the subscription terms for subscription contracts.
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
  const events = await submitTxBlocking(tx, waitUntil, keyring)
  return events.findEventOrThrow(ContractSubscriptionTermsAcceptedEvent)
}
