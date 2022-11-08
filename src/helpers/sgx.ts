// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { combine, split } from "shamirs-secret-sharing"
import { IKeyringPair } from "@polkadot/types/types"
import { u8aToString } from "@polkadot/util"
import axios from "axios"

export const SSSA_NUMSHARES = 5
export const SSSA_THRESHOLD = 3

export const SGX_STORE_ENDPOINT = "/api/nft/storeSecretShares"
export const SGX_RETRIEVE_ENDPOINT = "/api/nft/retrieveSecretShares"

export type SecretDataType = {
  nft_id: number
  data: Uint8Array
}

export type SecretPayload = {
  account_address: string
  secret_data: {
    nft_id: number
    data: Uint8Array
  }
  signature: string
}

/**
 * @name generateSSSShares
 * @summary             TODO
 * @param privateKey    TODO
 * @returns             TODO
 */
export const generateSSSShares = (privateKey: string): string[] => {
  const shares = split(privateKey, {
    shares: SSSA_NUMSHARES,
    threshold: SSSA_THRESHOLD,
  })
  const base64shares: string[] = shares.map((bufferShare: any) => bufferShare.toString("base64"))

  return base64shares
}

/**
 * @name combineSSSShares
 * @summary             TODO
 * @param shares        TODO
 * @returns             TODO
 */
export const combineSSSShares = (shares: string[]): string => {
  const hexShares = shares.map((bufferShare) => Buffer.from(bufferShare, "base64").toString("hex"))
  const combinedShares = combine(hexShares)
  return combinedShares.toString("utf8")
}

/**
 * @name getSgxEnclaves
 * @summary             TODO
 * @returns             TODO
 */
export const getSgxEnclaves = async () => {
  // query storage to chain
  return ["url1", "url2", "url3"]
}

/**
 * @name getSignature
 * @summary             TODO
 * @param keyring       TODO
 * @param secretData    TODO
 * @returns             TODO
 */
export const getSignature = (keyring: IKeyringPair, secretData: SecretDataType) => {
  const finalData = new Uint8Array(Buffer.from(JSON.stringify(secretData)))
  return u8aToString(keyring.sign(finalData)) // u8aToHex ?
}

/**
 * @name formatPayload
 * @summary             TODO
 * @param nftId       TODO
 * @param share       TODO
 * @param keyring       TODO
 * @returns             TODO
 */
export const formatPayload = (nftId: number, share: Uint8Array, keyring: IKeyringPair): SecretPayload => {
  const secretData = {
    nft_id: nftId,
    data: share,
  }
  const signature = getSignature(keyring, secretData)
  return {
    account_address: keyring.address,
    secret_data: secretData,
    signature,
  }
}

/**
 * @name sgxUpload
 * @summary             TODO
 * @param baseUrl       TODO
 * @param secretPayload TODO
 * @returns             TODO
 */
export const sgxUpload = async (baseUrl: string, secretPayload: SecretPayload) => {
  await axios
    .request({
      method: "post",
      url: `${baseUrl}${SGX_STORE_ENDPOINT}`,
      headers: { "Content-Type": "application/json" },
      data: secretPayload,
    })
    .catch((err) => {
      throw new Error(err)
    })
}

/**
 * @name sgxSSSSharesUpload
 * @summary             TODO
 * @param shares       TODO
 * @param nftId       TODO
 * @param keyring       TODO
 * @returns             TODO
 */
export const sgxSSSSharesUpload = async (shares: string[], nftId: number, keyring: IKeyringPair) => {
  const sgxEnclaves = await getSgxEnclaves()
  const sharesUpload = await Promise.all(
    shares.map((s, idx) => {
      const share = new Uint8Array(Buffer.from(s))
      const secretPayload = formatPayload(nftId, share, keyring)
      const enclaveBaseUrl = sgxEnclaves[idx]
      return sgxUpload(enclaveBaseUrl, secretPayload)
    }),
  )
  return sharesUpload
}

//nftID, pgpPrivateKey, addressPubTernoa, keyring
{
  // generateSSSShares
  // getSgxEnclaves
  // getSignature <- Keyring
  // formatterPostData
  // const encryptedSGXData = await cryptData(sgxData, serverPGPKey) ?????
  // sgxSSSSharesUpload
}

//nftID, pgpPrivateKey, addressPubTernoa, signature
{
  // generateSSSShares
  // getSgxEnclaves
  // getSignature
  // formatterPostData
  // sgxSSSSharesUpload
}
