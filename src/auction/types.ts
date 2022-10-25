import BN from "bn.js"

export type Bidder = {
  bidder: string
  amount: string
  amountRounded: number
}

export type AuctionChainRawDataType = {
  creator: string
  startBlock: number
  endBlock: number
  startPrice: BN
  buyItPrice: BN | null
  bidders: { list: [string[]] }
  marketplaceId: number
  isExtended: boolean
}

export type AuctionDataType = {
  creator: string
  startBlock: number
  endBlock: number
  startPrice: string
  startPriceRounded: number
  buyItPrice: string | null
  buyItPriceRounded: number | null
  bidders: Bidder[]
  marketplaceId: number
  isExtended: boolean
}

export type ClaimableBidBalanceDataType = {
  claimable: string
  claimableRounded: number
}
