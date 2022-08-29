import { ICollectionMetadata, INFTMetadata } from "./types"

import { ipfsFilesUpload } from "../helpers/ipfs"
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

/**
 * @name nftIpfsUpload
 * @summary         Uploads your NFT offchain metadata on IPFS.
 * @param data      Offchain metadata to be uploaded. It must fit the INFTMetadata interface format with a description, file and title.
 * @returns         The data object with the hash to add as offchain metadata in the extrinsic.
 */
export const nftIpfsUpload = async (data: INFTMetadata) => {
  const { description, file, title } = data
  if (file === null) throw new Error(Errors.IPFS_FILE_NULL_ON_UPLOAD)
  const { hash: fileHash } = await ipfsFilesUpload(file)
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
  return await ipfsFilesUpload(finalFile)
}

/**
 * @name collectionIpfsUpload
 * @summary         Uploads your Collection offchain metadata on IPFS.
 * @param data      Offchain metadata to be uploaded. It must fit the ICollectionMetadata interface format with a name, description, profileFile and a bannerFile.
 * @returns         The data object with the hash to add as offchain metadata in the extrinsic.
 */
export const collectionIpfsUpload = async (data: ICollectionMetadata) => {
  const { name, description, profileFile, bannerFile } = data
  if (profileFile === null || bannerFile === null) throw new Error(Errors.IPFS_FILE_NULL_ON_UPLOAD)
  const { hash: profileFileHash } = await ipfsFilesUpload(profileFile)
  const { hash: bannerFileHash } = await ipfsFilesUpload(bannerFile)
  const collectionMetadata = {
    name,
    description,
    profileImage: profileFileHash,
    bannerImage: bannerFileHash,
  }
  const finalBlob = new Blob([JSON.stringify(collectionMetadata)], { type: "application/json" })
  const finalFile = new File([finalBlob], "collection metadata")
  return await ipfsFilesUpload(finalFile)
}
