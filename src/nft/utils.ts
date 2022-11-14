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
  const { description, fileDataBuffer, fileName: name, fileType: type, title } = data
  if (!fileDataBuffer) throw new Error(Errors.IPFS_FILE_UNDEFINED_ON_UPLOAD)
  const { hash: fileHash, size } = await ipfsFileUpload(fileDataBuffer, ipfsGateway, apiKey)
  const nftMetadata = {
    title,
    description,
    image: fileHash,
    properties: {
      media: {
        hash: fileHash,
        size,
        type,
        ...(name && { name }),
      },
    },
  }
  const metadataBuffer = Buffer.from(JSON.stringify(nftMetadata))
  return await ipfsFileUpload(metadataBuffer, ipfsGateway, apiKey)
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
  const { name, description, profileFileDataBuffer, bannerFileDataBuffer } = data
  if (!profileFileDataBuffer || !bannerFileDataBuffer) throw new Error(Errors.IPFS_FILE_UNDEFINED_ON_UPLOAD)
  const { hash: profileFileHash } = await ipfsFileUpload(profileFileDataBuffer, ipfsGateway, apiKey)
  const { hash: bannerFileHash } = await ipfsFileUpload(bannerFileDataBuffer, ipfsGateway, apiKey)
  const collectionMetadata = {
    name,
    description,
    profileImage: profileFileHash,
    bannerImage: bannerFileHash,
  }

  const finalFile = Buffer.from(JSON.stringify(collectionMetadata))
  return await ipfsFileUpload(finalFile, ipfsGateway, apiKey)
}
