import BN from "bn.js"
import {
  AcceptanceAction,
  CancellationFeeAction,
  DurationAction,
  RentFeeAction,
  SubscriptionActionDetails,
} from "./enum"

export type DurationSubscriptionDetailsType = {
  [SubscriptionActionDetails.PeriodLength]: number
  [SubscriptionActionDetails.MaxDuration]: number | null
  [SubscriptionActionDetails.IsChangeable]: boolean
  [SubscriptionActionDetails.NewTerms]?: boolean
}
export type DurationFixedType = { [DurationAction.Fixed]: number }
export type DurationSubscriptionType = { [DurationAction.Subscription]: DurationSubscriptionDetailsType }
export type DurationType = DurationFixedType | DurationSubscriptionType

export type AutoAcceptanceType = { [AcceptanceAction.AutoAcceptance]: string[] | null }
export type ManualAcceptanceType = { [AcceptanceAction.ManualAcceptance]: string[] | null }
export type AcceptanceType = AutoAcceptanceType | ManualAcceptanceType

export type RentFeeTokensType = { [RentFeeAction.Tokens]: BN | number }
export type RentFeeNFTType = { [RentFeeAction.NFT]: number }
export type RentFeeType = RentFeeTokensType | RentFeeNFTType

export type CancellationFeeFixedTokensType = { [CancellationFeeAction.FixedTokens]: BN | number }
export type CancellationFeeFlexibleTokensType = { [CancellationFeeAction.FlexibleTokens]: BN | number }
export type CancellationFeeNFTType = { [CancellationFeeAction.NFT]: number }
export type CancellationFeeType =
  | CancellationFeeAction.None
  | CancellationFeeFixedTokensType
  | CancellationFeeFlexibleTokensType
  | CancellationFeeNFTType

export type RentalContractDataType = {
  startBlock: number | null
  startBlockDate: Date | null
  renter: string
  rentee: string | null
  duration: DurationType
  acceptance: AcceptanceAction
  acceptanceList: string[]
  rentFee: RentFeeAction
  rentFeeValue: string | number
  rentFeeValueRounded: number
  renterCanRevoke: boolean
  renterCancellationFee: CancellationFeeAction
  renterCancellationFeeValue: string | number | null
  renterCancellationFeeValueRounded: number | null
  renteeCancellationFee: CancellationFeeAction
  renteeCancellationFeeValue: string | number | null
  renteeCancellationFeeValueRounded: number | null
}

export type RentalContractChainRawDataType = {
  startBlock: number | null
  renter: string
  rentee: string | null
  duration: any //DurationType
  acceptanceType: any //AcceptanceType
  renterCanRevoke: boolean
  rentFee: any //RentFeeType
  renterCancellationFee: any //CancellationFeeType
  renteeCancellationFee: any //CancellationFeeType
}

export type ActiveFixedContractType = {
  nftId: number
  endingBlockId: number
}

export type ActiveSubscribedContractType = {
  nftId: number
  renewalOrEndBlockId: number
}

export type AvailableRentalContractType = {
  nftId: number
  expirationBlockId: number
}

export type RentingQueuesType = {
  fixedQueue: ActiveFixedContractType[]
  subscriptionQueue: ActiveSubscribedContractType[]
  availableQueue: AvailableRentalContractType[]
}

export type RentingQueuesRawType = {
  fixedQueue: number[][]
  subscriptionQueue: number[][]
  availableQueue: number[][]
}
