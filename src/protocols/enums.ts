export enum TransmissionCancellationAction {
  UntilBlock = "untilBlock",
  Anytime = "anytime",
  None = "none",
}

export enum ProtocolAction {
  AtBlock = "atBlock",
  AtBlockWithReset = "atBlockWithReset",
  OnConsent = "onConsent",
  OnConsentAtBlock = "onConsentAtBlock",
}
