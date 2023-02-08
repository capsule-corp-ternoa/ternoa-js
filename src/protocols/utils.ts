import { ProtocolAction, TransmissionCancellationAction } from "./enums"
import {
  TransmissionAtBlock,
  TransmissionAtBlockWithReset,
  TransmissionCancellation,
  TransmissionOnConsent,
  TransmissionOnConsentAtBlock,
} from "./types"
import { isValidAddress } from "../blockchain"

/**
 * @name formatAtBlockProtocol
 * @summary                        Returns an object according to the atBlock transmission protocol format.
 * @param protocol                 The protocol (string) : "atBlock".
 * @param executionBlock           The block number to execute the atBlock transmission protocol.
 * @returns                        An object representing the atBlock transmission protocol.
 */
export const formatAtBlockProtocol = (protocol: "atBlock", executionBlock: number): TransmissionAtBlock => {
  if (protocol !== ProtocolAction.AtBlock) throw new Error("INCORRECT_PROTOCOL: expected 'atBlock'.")
  if (typeof executionBlock !== "number") throw new Error("MUST_BE_A_NUMBER: executionBlock must be a number.")
  return { [ProtocolAction.AtBlock]: executionBlock }
}

/**
 * @name formatAtBlockWithResetProtocol
 * @summary                        Returns an object according to the atBlockWithReset transmission protocol format.
 * @param protocol                 The protocol (string) : "BlockWithReset".
 * @param executionBlockWithReset  The block number to execute the atBlockWithReset transmission protocol. It can be updated later by user.
 * @returns                        An object representing the atBlockWithReset transmission protocol.
 */
export const formatAtBlockWithResetProtocol = (
  protocol: "atBlockWithReset",
  executionBlockWithReset: number,
): TransmissionAtBlockWithReset => {
  if (protocol !== ProtocolAction.AtBlockWithReset) throw new Error("INCORRECT_PROTOCOL: expected 'atBlockWithReset'.")
  if (typeof executionBlockWithReset !== "number")
    throw new Error("MUST_BE_A_NUMBER: executionBlockWithReset must be a number.")
  return { [ProtocolAction.AtBlockWithReset]: executionBlockWithReset }
}

/**
 * @name formatOnConsentProtocol
 * @summary                        Returns an object according to the OnConsent transmission protocol format.
 * @param protocol                 The protocol (string) : "OnConsent".
 * @param consentList              An array of account address that need to consent the protocol.
 * @param threshold                The minimum number of consent to valid the protocol execution.
 * @returns                        An object representing the onConsent transmission protocol.
 */
export const formatOnConsentProtocol = (
  protocol: "onConsent",
  consentList: string[],
  threshold: number,
): TransmissionOnConsent => {
  if (protocol !== ProtocolAction.OnConsent) throw new Error("INCORRECT_PROTOCOL: expected 'onConsent'.")
  consentList.map((address) => {
    if (typeof address !== "string" && !isValidAddress(address))
      throw new Error("MUST_BE_A_STRING: consentList must only contains only valid address.")
  })
  if (typeof threshold !== "number") throw new Error("MUST_BE_A_NUMBER: threshold must be a number.")
  return {
    [ProtocolAction.OnConsent]: {
      consentList,
      threshold,
    },
  }
}

/**
 * @name formatOnConsentAtBlockProtocol
 * @summary                        Returns an object according to the onConsentAtBlock transmission protocol format.
 * @param protocol                 The protocol (string) : "onConsentAtBlock".
 * @param consentList              An array of account address that need to consent the protocol.
 * @param threshold                The minimum number of consent to valid the protocol execution.
 * @param block                    The block number before which each user consent is expected.
 * @returns                        An object representing the onConsentAtBlock transmission protocol.
 */
export const formatOnConsentAtBlockProtocol = (
  protocol: "onConsentAtBlock",
  consentList: string[],
  threshold: number,
  block: number,
): TransmissionOnConsentAtBlock => {
  if (protocol !== ProtocolAction.OnConsentAtBlock) throw new Error("INCORRECT_PROTOCOL: expected 'onConsentAtBlock'.")
  consentList.map((address) => {
    if (typeof address !== "string" && !isValidAddress(address))
      throw new Error("MUST_BE_A_STRING: consentList must only contains only valid address.")
  })
  if (typeof threshold !== "number" && typeof block !== "number")
    throw new Error("MUST_BE_A_NUMBER: threshold and block must be numbers.")
  return {
    [ProtocolAction.OnConsentAtBlock]: {
      consentList,
      threshold,
      block,
    },
  }
}

/**
 * @name formatProtocolCancellation
 * @summary                        Returns an object according to the cancellation kind required.
 * @param cancellation             The cancellation kind (string) : "anytime", "none" or "untilBlock".
 * @param UntilBlock               The block number before which user cancellation is available. Can only be set for "untilBlock" cancellation.
 * @returns                        An object representing the cancellation of the transmission protocol.
 */
export const formatProtocolCancellation = (
  cancellation: "anytime" | "none" | "untilBlock",
  UntilBlock?: number,
): TransmissionCancellation => {
  if (
    cancellation !== TransmissionCancellationAction.Anytime &&
    cancellation !== TransmissionCancellationAction.None &&
    cancellation !== TransmissionCancellationAction.UntilBlock
  )
    throw new Error("INCORRECT_CANCELLATION: cancellation must be either 'anytime', 'none' or 'untilBlock'.")
  if (
    UntilBlock &&
    (cancellation == TransmissionCancellationAction.None || cancellation == TransmissionCancellationAction.Anytime)
  )
    throw new Error("INCORRECT_CANCELLATION: untilBlock number can't be set for 'anytime' or 'none' cancellation.")
  if (cancellation == TransmissionCancellationAction.UntilBlock && !UntilBlock)
    throw new Error("MISSING_DATA: untilBlock cancellation must have 'UntilBlock' param define as number.")
  if (UntilBlock && typeof UntilBlock !== "number") throw new Error("MUST_BE_A_NUMBER: UntilBlock must be a number.")

  return cancellation === TransmissionCancellationAction.Anytime
    ? { [TransmissionCancellationAction.Anytime]: null }
    : cancellation === TransmissionCancellationAction.UntilBlock && UntilBlock
    ? { [TransmissionCancellationAction.UntilBlock]: UntilBlock }
    : { [TransmissionCancellationAction.None]: null }
}
