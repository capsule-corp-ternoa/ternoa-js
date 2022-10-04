import BN from "bn.js"
import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction, RevocationAction } from "./enum"

export type DurationFixedType = { [DurationAction.Fixed]: number }
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

export type CancellationFeeFixedTokensType = { [CancellationFeeAction.FixedTokens]: BN | number }
export type CancellationFeeFlexibleTokensType = { [CancellationFeeAction.FlexibleTokens]: BN | number }
export type CancellationFeeNFTType = { [CancellationFeeAction.NFT]: number }
export type CancellationFeeType =
  | CancellationFeeFixedTokensType
  | CancellationFeeFlexibleTokensType
  | CancellationFeeNFTType

export type RentalContractDataType = {
  hasStarted: boolean
  startBlock: number | null
  startBlockDate: Date | null
  renter: string
  rentee: string | null
  durationType: DurationAction
  blockDuration: number | null
  blockSubscriptionRenewal: number | null
  acceptanceType: AcceptanceAction
  acceptanceList: string[]
  revocationType: RevocationAction
  rentFeeType: RentFeeAction
  rentFee: string | number
  rentFeeRounded: number
  renterCancellationFeeType: CancellationFeeAction | null
  renterCancellationFee: string | number | null
  renterCancellationFeeRounded: number | null
  renteeCancellationFeeType: CancellationFeeAction | null
  renteeCancellationFee: string | number | null
  renteeCancellationFeeRounded: number | null
  termsAccepted: boolean
}

export type RentalContractChainRawDataType = {
  hasStarted: boolean
  startBlock: number | null
  renter: string
  rentee: string | null
  duration: any // {[key:string]:string |number[] | null } when infinite log from chain data=> {infinite : null}
  acceptanceType: any
  revocationType: RevocationType
  rentFee: any
  termsAccepted: boolean
  renterCancellationFee: any
  renteeCancellationFee: any
}

export type AvailableRentalContractType = {
  nftId: number
  contractExpirationBlockId: number
  contractExpirationDate: Date
}

export type ActiveFixedContractType = {
  nftId: number
  contractEndingBlockId: number
  contractEndingDate: Date
}

export type ActiveSubscribedContractType = {
  nftId: number
  contractRenewalOrEndBlockId: number
  contractRenewalOrEndDate: Date
}
