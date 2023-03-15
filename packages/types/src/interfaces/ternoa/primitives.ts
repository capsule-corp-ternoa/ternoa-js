import { buildTypes } from "./utils"

const v0 = buildTypes({
  types: {
    TernoaPalletsPrimitivesCommonCompoundFee: {
      _enum: {
        Flat: "Balance",
        Percentage: "Permill",
      },
    },
    TernoaPalletsPrimitivesCommonConfigOp: {
      _enum: {
        Noop: "Null",
        Set: "TernoaPalletsPrimitivesCommonCompoundFee",
        Remove: "Null",
      },
    },
  },
})

export default [v0]
