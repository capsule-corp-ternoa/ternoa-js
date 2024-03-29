export enum DurationAction {
  Fixed = "fixed",
  Subscription = "subscription",
}

export enum SubscriptionActionDetails {
  PeriodLength = "periodLength",
  MaxDuration = "maxDuration",
  IsChangeable = "isChangeable",
  NewTerms = "newTerms",
}

export enum AcceptanceAction {
  AutoAcceptance = "autoAcceptance",
  ManualAcceptance = "manualAcceptance",
}

export enum RentFeeAction {
  Tokens = "tokens",
  NFT = "nft",
}

export enum CancellationFeeAction {
  FixedTokens = "fixedTokens",
  FlexibleTokens = "flexibleTokens",
  NFT = "nft",
  None = "None",
}
