import { CommissionFeeType, IMarketplaceMetadata, ListingFeeType } from "./types"

import { formatPermill } from "../helpers/utils"
import { numberToBalance } from "../blockchain"
import { ipfsFilesUpload } from "../helpers/ipfs"

/**
 * @name formatMarketplaceFee
 * @summary         Checks the type fee and format it accordingly. Numbers are formatted into BN. Percentages are formatted in Permill.
 * @param fee       The fee to format : It can only be an CommissionFeeType or ListingFeeType.
 * @returns         The formatted fee.
 */
export const formatMarketplaceFee = async (fee: CommissionFeeType | ListingFeeType) => {
  if (typeof fee === "object") {
    if (typeof fee.set.flat === "number") {
      const flatFee = await numberToBalance(fee.set.flat)
      fee.set.flat = flatFee
    }
    if (fee.set.percentage) {
      const percentageFee = formatPermill(fee.set.percentage)
      fee.set.percentage = percentageFee
    }
  }
  return fee
}

/**
 * @name marketplaceIpfsUpload
 * @summary         Uploads your marketplace offchain metadata on IPFS.
 * @param data      Offchain metadata to be uploaded. It must fit the IMarketplaceMetadata interface format with a name and logoUri.
 * @returns         The data object with the hash to add as offchain metadata in the extrinsic.
 */
export const marketplaceIpfsUpload = async (data: IMarketplaceMetadata) => {
  const { name, logoUri } = data
  const marketplaceMetadata = {
    name,
    logoUri,
  }
  const finalBlob = new Blob([JSON.stringify(marketplaceMetadata)], { type: "application/json" })
  const finalFile = new File([finalBlob], "marketplace metadata")
  return await ipfsFilesUpload(finalFile)
}
