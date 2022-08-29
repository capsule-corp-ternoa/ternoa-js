import BN from "bn.js"
import { DurationAction } from "./enums"

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

export type DurationFixedType = { [DurationAction.Fixed]: RequireOnlyOne<number> }
export type DurationSubscriptionType = { [DurationAction.Subscription]: number[] }
export type DurationType = DurationAction.Infinite | DurationFixedType | DurationSubscriptionType