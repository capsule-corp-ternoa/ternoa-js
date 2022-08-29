import { ICollectionMetadata, INFTMetadata } from "./types"

import { uploadFiles } from "../helpers/ipfs"
import { Errors } from "../constants"

/**
 * @name formatPermill
 * @summary         Checks that percent is in range 0 to 100 and format to permill.
 * @param percent   Number in range from 0 to 100 with max 4 decimals.
 * @returns         The formated percent in permill format.
 */
export const formatPermill = (percent: number): number => {
  if (percent > 100 || percent < 0) {
    throw new Error(Errors.MUST_BE_PERCENTAGE)
  }

  return parseFloat(percent.toFixed(4)) * 10000
}

export const nftIpfsUpload = async (data: INFTMetadata) => {
  const { description, file, title } = data
  if (file === null) throw new Error("File cannot be null on ipfs upload")
  const { hash: fileHash } = await uploadFiles(file)
  const nftMetadata = {
    title,
    description,
    image: fileHash,
    properties: {
      media: {
        hash: fileHash,
        name: file?.name,
        size: file?.size,
        type: file?.type,
      },
    },
  }
  const finalBlob = new Blob([JSON.stringify(nftMetadata)], { type: "application/json" })
  const finalFile = new File([finalBlob], "nft metadata")
  return await uploadFiles(finalFile)
}

export const collectionIpfsUpload = async (data: ICollectionMetadata) => {
  const { name, description, profileFile, bannerFile } = data
  if (profileFile === null || bannerFile === null) throw new Error("File cannot be null on ipfs upload")
  const { hash: profileFileHash } = await uploadFiles(profileFile)
  const { hash: bannerFileHash } = await uploadFiles(bannerFile)
  const collectionMetadata = {
    name,
    description,
    profileImage: profileFileHash,
    bannerImage: bannerFileHash,
  }
  const finalBlob = new Blob([JSON.stringify(collectionMetadata)], { type: "application/json" })
  const finalFile = new File([finalBlob], "collection metadata")
  return await uploadFiles(finalFile)
}
