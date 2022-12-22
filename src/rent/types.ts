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

export type RentFeeTokensType = { [RentFeeAction.Tokens]: number | BN }
export type RentFeeNFTType = { [RentFeeAction.NFT]: number }
export type RentFeeType = RentFeeTokensType | RentFeeNFTType

export type CancellationFeeFixedTokensType = { [CancellationFeeAction.FixedTokens]: number | BN }
export type CancellationFeeFlexibleTokensType = { [CancellationFeeAction.FlexibleTokens]: number | BN }
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
  acceptanceType: AcceptanceAction
  acceptanceList: string[]
  rentFeeType: RentFeeAction
  rentFee: string | number
  rentFeeRounded: number
  renterCanRevoke: boolean
  renterCancellationFeeType: CancellationFeeAction
  renterCancellationFee: string | number | null
  renterCancellationFeeRounded: number | null
  renteeCancellationFeeType: CancellationFeeAction
  renteeCancellationFee: string | number | null
  renteeCancellationFeeRounded: number | null
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
