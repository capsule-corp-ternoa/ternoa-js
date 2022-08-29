import axios from "axios"
import mime from "mime-types"

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
