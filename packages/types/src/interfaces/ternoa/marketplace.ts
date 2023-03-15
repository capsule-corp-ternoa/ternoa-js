import { buildTypes } from "./utils"

const v0 = buildTypes({
  types: {
    MarketplaceId: "u32",
    TernoaMarketplaceSale: {
      accountId: "AccountId",
      marketplaceId: "MarketplaceId",
      price: "Balance",
      commissionFee: "Option<TernoaPalletsPrimitivesCommonCompoundFee<Balance>>",
    },
  },
})

export default [v0]
