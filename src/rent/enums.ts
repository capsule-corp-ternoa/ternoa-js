export enum DurationAction {
  Fixed = "Fixed",
  Subscription = "Subscription",
  Infinite = "Infinite",
}

export enum AcceptanceAction {
  AutoAcceptance = "AutoAcceptance",
  ManualAcceptance = "ManualAcceptance",
}

export enum RevocationAction {
  NoRevocation = "NoRevocation",
  OnSubscriptionChange = "OnSubscriptionChange",
  Anytime = "Anytime",
}

export enum RentFeeAction {
  Tokens = "Tokens",
  NFT = "NFT",
}

export enum CancellationFeeAction {
  FixedTokens = "FixedTokens",
  FlexibleTokens = "FlexibleTokens",
  NFT = "NFT",
}
