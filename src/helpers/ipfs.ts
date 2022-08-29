import axios from "axios"
import mime from "mime-types"

import { removeURLSlash } from "./utils"

const DEFAULT_IPFS_GATEWAY = "https://ipfs.ternoa.dev"

/**
 * @name ipfsFilesUpload
 * @summary             Uploads a file on an IFPS gateway.
 * @param file          File to upload on IPFS.
 * @param ipfsGateway   IPFS gateway to upload your file on. Default is https://ipfs.ternoa.dev.
 * @returns             A formatted object datas with name, hash, size and type.
 */
export const ipfsFilesUpload = async (file: File, ipfsGateway?: string) => {
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

/**
 * @name formatIpfsResponse
 * @summary             Format the IPFS post response.
 * @param res           An IPFS post request response.
 * @returns             A formatted object datas with name, hash, size and type.
 */
export const formatIpfsResponse = (res: any) => {
  const type = mime.lookup(res.Name)
  return {
    name: res.Name,
    hash: res.Hash,
    size: res.Size,
    type: type || "",
  }
}
