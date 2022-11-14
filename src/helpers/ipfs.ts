import axios from "axios"
import FormData from "form-data"

import { IpfsAddDataResponseType } from "./types"

export const DEFAULT_IPFS_GATEWAY = "https://ipfs.ternoa.dev/api/v0/add"

/**
 * @name ipfsFilesUpload
 * @summary             Uploads a file on an IFPS gateway.
 * @param file          File to upload on IPFS.
 * @param ipfsGateway   IPFS gateway to upload your file on. Default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             A formatted object datas with name, hash, size and type.
 */
export const ipfsFileUpload = async (file: Buffer, ipfsGateway?: string, apiKey?: string) => {
  const formData = new FormData()
  formData.append("file", file)
  const headers = apiKey ? { apiKey } : undefined
  const response = await axios
    .request({
      method: "post",
      url: ipfsGateway ? ipfsGateway : DEFAULT_IPFS_GATEWAY,
      headers: headers,
      data: formData,
    })
    .catch((err) => {
      throw new Error(err)
    })
  const { data } = response
  const { Hash, Size } = data as IpfsAddDataResponseType
  return {
    hash: Hash,
    size: Size,
  }
}
