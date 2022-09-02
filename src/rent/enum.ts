export enum DurationAction {
  Fixed = "fixed",
  Subscription = "subscription",
  Infinite = "Infinite",
}

export enum AcceptanceAction {
  AutoAcceptance = "autoAcceptance",
  ManualAcceptance = "manualAcceptance",
}

export enum RevocationAction {
  NoRevocation = "NoRevocation",
  OnSubscriptionChange = "OnSubscriptionChange",
  Anytime = "Anytime",
}

export enum RentFeeAction {
  Tokens = "tokens",
  NFT = "NFT",
}

export enum CancellationFeeAction {
  FixedTokens = "fixedTokens",
  FlexibleTokens = "flexibleTokens",
  NFT = "NFT",
}
