import { CommissionFeeType, IMarketplaceMetadata, ListingFeeType } from "./types"

import { formatPermill } from "../helpers/utils"
import { numberToBalance } from "../blockchain"
import { ipfsFileUpload } from "../helpers/ipfs"
import { Errors } from "../constants"

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
 * @summary             Uploads your marketplace offchain metadata on IPFS.
 * @param data          Offchain metadata to be uploaded. It must fit the IMarketplaceMetadata interface format with a name and logoUri.
 * @param ipfsGateway   IPFS gateway to upload your file on. If not provided, default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             The data object with the hash to add as offchain metadata in the extrinsic.
 */
export const marketplaceIpfsUpload = async (data: IMarketplaceMetadata, ipfsGateway?: string, apiKey?: string) => {
  const { name, logoFile } = data
  if (!logoFile) throw new Error(Errors.IPFS_FILE_UNDEFINED_ON_UPLOAD)
  const { hash: logoFileHash } = await ipfsFileUpload(logoFile, ipfsGateway, apiKey)
  const marketplaceMetadata = {
    name,
    logoUri: logoFileHash,
  }
  const finalBlob = new Blob([JSON.stringify(marketplaceMetadata)], { type: "application/json" })
  const finalFile = new File([finalBlob], "marketplace metadata")
  return await ipfsFileUpload(finalFile, ipfsGateway, apiKey)
}
