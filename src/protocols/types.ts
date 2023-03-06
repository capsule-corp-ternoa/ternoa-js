import { ProtocolAction, TransmissionCancellationAction } from "./enums" // ProtocolAction,

export type ProtocolAtBlockQueue = {
  nftId: number
  blockNumber: number
}

export type ProtocolOnConsentData = {
  consentList: string[]
  threshold: number
  block: number
}

export type TransmissionAtBlock = { [ProtocolAction.AtBlock]: number }
export type TransmissionAtBlockWithReset = { [ProtocolAction.AtBlockWithReset]: number }
export type TransmissionOnConsent = {
  [ProtocolAction.OnConsent]: Omit<ProtocolOnConsentData, "block">
}
export type TransmissionOnConsentAtBlock = {
  [ProtocolAction.OnConsentAtBlock]: ProtocolOnConsentData
}
export type Protocols =
  | TransmissionAtBlock
  | TransmissionAtBlockWithReset
  | TransmissionOnConsent
  | TransmissionOnConsentAtBlock

export type TransmissionCancellationAtBlock = { [TransmissionCancellationAction.UntilBlock]: number }
export type TransmissionCancellationAtAnytime = { [TransmissionCancellationAction.Anytime]: null }
export type TransmissionCancellationAtNone = { [TransmissionCancellationAction.None]: null }
export type TransmissionCancellation =
  | TransmissionCancellationAtNone
  | TransmissionCancellationAtAnytime
  | TransmissionCancellationAtBlock

export type Transmissions = {
  recipient: string
  protocol: Protocols
  cancellation: TransmissionCancellation
}
