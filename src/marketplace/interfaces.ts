import BN from "bn.js"
import { MarketplaceConfigAction } from "../constants"

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

export interface IFeeType {
  percentage: number
  flat: BN | number
}

export type SetFeeType = { [MarketplaceConfigAction.Set]: RequireOnlyOne<IFeeType> }

export type CommissionFeeType = MarketplaceConfigAction.Noop | MarketplaceConfigAction.Remove | SetFeeType
export type ListingFeeType = MarketplaceConfigAction.Noop | MarketplaceConfigAction.Remove | SetFeeType
export type AccountListType =
  | MarketplaceConfigAction.Noop
  | MarketplaceConfigAction.Remove
  | { [MarketplaceConfigAction.Set]: string[] }
export type OffchainDataType =
  | MarketplaceConfigAction.Noop
  | MarketplaceConfigAction.Remove
  | { [MarketplaceConfigAction.Set]: string }

export type IMarketplaceData = {
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
  commissionFee?: RequireOnlyOne<IFeeType>
}
