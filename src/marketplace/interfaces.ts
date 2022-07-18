import BN from "bn.js"

export interface IFeeType {
  percentage?: number
  flat?: BN
}

export interface IMarketplaceData {
  owner: string
  kind: string
  commissionFee: IFeeType | undefined
  listingFee: IFeeType | undefined
  accountList: string[] | undefined
  offchainData: string | undefined
}

export interface IListedNft {
  accountId: string
  marketplaceId: number
  price: BN
  commissionFee: IFeeType | undefined
}
// difference or best practice between:
// commissionFee: IFeeType | undefined
// and
// commissionFee?: IFeeType
