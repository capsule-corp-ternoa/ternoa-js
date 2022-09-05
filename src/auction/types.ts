import { BalanceType } from "../blockchain"

export type Bidder = {
  bidder: string
  amount: BalanceType
  amountRounded: number
}

export type AuctionChainRawDataType = {
  creator: string
  startBlock: number
  endBlock: number
  startPrice: BalanceType
  buyItPrice: BalanceType | null
  bidders: { list: [string[]] }
  marketplaceId: number
  isExtended: boolean
}

export type AuctionDataType = {
  creator: string
  startBlock: number
  endBlock: number
  startPrice: BalanceType
  startPriceRounded: number
  buyItPrice: BalanceType | null
  buyItPriceRounded: number | null
  bidders: Bidder[]
  marketplaceId: number
  isExtended: boolean
}

export type ClaimableBidBalanceDataType = {
  claimable: BalanceType
  claimableRounded: number
}
