import { ICollectionMetadata, INFTMetadata } from "./types"

import { ipfsFileUpload } from "../helpers/ipfs"
import { Errors } from "../constants"

/**
 * @name nftIpfsUpload
 * @summary             Uploads your NFT offchain metadata on IPFS.
 * @param data          Offchain metadata to be uploaded. It must fit the INFTMetadata interface format with a description, file and title.
 * @param ipfsGateway   IPFS gateway to upload your file on. If not provided, default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             The data object with the hash to add as offchain metadata in the extrinsic.
 */
export const nftIpfsUpload = async (data: INFTMetadata, ipfsGateway?: string, apiKey?: string) => {
  const { description, file, title } = data
  if (file === null) throw new Error(Errors.IPFS_FILE_NULL_ON_UPLOAD)
  const { hash: fileHash } = await ipfsFileUpload(file, ipfsGateway, apiKey)
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
  return await ipfsFileUpload(finalFile, ipfsGateway, apiKey)
}

/**
 * @name collectionIpfsUpload
 * @summary             Uploads your Collection offchain metadata on IPFS.
 * @param data          Offchain metadata to be uploaded. It must fit the ICollectionMetadata interface format with a name, description, profileFile and a bannerFile.
 * @param ipfsGateway   IPFS gateway to upload your file on. If not provided, default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             The data object with the hash to add as offchain metadata in the extrinsic.
 */
export const collectionIpfsUpload = async (data: ICollectionMetadata, ipfsGateway?: string, apiKey?: string) => {
  const { name, description, profileFile, bannerFile } = data
  if (profileFile === null || bannerFile === null) throw new Error(Errors.IPFS_FILE_NULL_ON_UPLOAD)
  const { hash: profileFileHash } = await ipfsFileUpload(profileFile, ipfsGateway, apiKey)
  const { hash: bannerFileHash } = await ipfsFileUpload(bannerFile, ipfsGateway, apiKey)
  const collectionMetadata = {
    name,
    description,
    profileImage: profileFileHash,
    bannerImage: bannerFileHash,
  }
  const finalBlob = new Blob([JSON.stringify(collectionMetadata)], { type: "application/json" })
  const finalFile = new File([finalBlob], "collection metadata")
  return await ipfsFileUpload(finalFile, ipfsGateway, apiKey)
}
