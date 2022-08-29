import BN from "bn.js"
import { AcceptanceAction, DurationAction, RentFeeAction, RevocationAction } from "./enums"

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

export type DurationFixedType = { [DurationAction.Fixed]: RequireOnlyOne<number> }
export type DurationSubscriptionType = { [DurationAction.Subscription]: number[] }
export type DurationType = DurationAction.Infinite | DurationFixedType | DurationSubscriptionType

export type AutoAcceptanceType = { [AcceptanceAction.AutoAcceptance]: string[] | null }
export type ManualAcceptanceType = { [AcceptanceAction.ManualAcceptance]: string[] | null }
export type AcceptanceType = AutoAcceptanceType | ManualAcceptanceType

export type RevocationType =
  | RevocationAction.NoRevocation
  | RevocationAction.OnSubscriptionChange
  | RevocationAction.Anytime

export type RentFeeTokensType = { [RentFeeAction.Tokens]: BN | number }
export type RentFeeNFTType = { [RentFeeAction.NFT]: number }
export type RentFeeType = RentFeeTokensType | RentFeeNFTType
