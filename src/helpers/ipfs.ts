import axios from "axios"
import mime from "mime-types"

export const DEFAULT_IPFS_GATEWAY = "https://ipfs.ternoa.dev/api/v0/add"

/**
 * @name ipfsFilesUpload
 * @summary             Uploads a file on an IFPS gateway.
 * @param file          File to upload on IPFS.
 * @param ipfsGateway   IPFS gateway to upload your file on. Default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             A formatted object datas with name, hash, size and type.
 */
export const ipfsFileUpload = async (file: File, ipfsGateway?: string, apiKey?: string) => {
  const formData = new FormData()
  formData.append(`file`, file)
  const headers = apiKey ? { apiKey: apiKey } : undefined
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
  return formatIpfsResponse(response.data)
}

/**
 * @name formatIpfsResponse
 * @summary             Format the IPFS response from a gateway upload.
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
