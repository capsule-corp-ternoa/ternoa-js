import axios from "axios"
import mime from "mime-types"
import { INFTMetadata, ICollectionMetadata } from "../nft/types"
import { IMarketplaceMetadata } from "../marketplace/types"

import { removeURLSlash } from "./utils"

const DEFAULT_IPFS_GATEWAY = "https://ipfs.ternoa.dev"

export const uploadFiles = async (file: File, ipfsGateway?: string) => {
  const IPFS_GATEWAY = ipfsGateway ? removeURLSlash(ipfsGateway) : removeURLSlash(DEFAULT_IPFS_GATEWAY)
  const IPFS_UPLOAD_URL = IPFS_GATEWAY + "/api/v0"
  const formData = new FormData()
  formData.append(`file`, file)
  const response = await axios
    .request({
      method: "post",
      url: `${IPFS_UPLOAD_URL}/add`,
      data: formData,
    })
    .catch((err) => {
      throw new Error(err)
    })
  return formatIpfsResponse(response.data)
}

export const formatIpfsResponse = (res: any) => {
  const type = mime.lookup(res.Name)
  return {
    name: res.Name,
    hash: res.Hash,
    size: res.Size,
    type: type || "",
  }
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

export const marketplaceIpfsUpload = async (data: IMarketplaceMetadata) => {
  const { name, logoUri } = data
  const marketplaceMetadata = {
    name,
    logoUri,
  }
  const finalBlob = new Blob([JSON.stringify(marketplaceMetadata)], { type: "application/json" })
  const finalFile = new File([finalBlob], "collection metadata")
  return await uploadFiles(finalFile)
}
