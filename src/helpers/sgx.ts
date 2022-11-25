// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { combine, split } from "shamirs-secret-sharing"
import { IKeyringPair } from "@polkadot/types/types"
import { u8aToHex } from "@polkadot/util"

import axios from "axios"

export const SSSA_NUMSHARES = 1
export const SSSA_THRESHOLD = 1

export const SGX_STORE_ENDPOINT = "/api/nft/storeSecretShares"
export const SGX_RETRIEVE_ENDPOINT = "/api/nft/retrieveSecretShares"

export type SecretPayload = {
  account_address: string
  secret_data: string
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
  return ["https://worker-ca-0.trnnfr.com", "https://worker-ca-0.trnnfr.com", "https://worker-ca-0.trnnfr.com"]
}

/**
 * @name getSignature
 * @summary             TODO
 * @param keyring       TODO
 * @param secretData    TODO
 * @returns             TODO
 */
export const getSignature = (keyring: IKeyringPair, secretData: string) => {
  const finalData = new Uint8Array(Buffer.from(secretData))
  return u8aToHex(keyring.sign(finalData))
}

/**
 * @name formatPayload
 * @summary             TODO
 * @param nftId       TODO
 * @param share       TODO
 * @param keyring       TODO
 * @returns             TODO
 */
export const formatPayload = (nftId: number, share: string | null, keyring: IKeyringPair): SecretPayload => {
  const secretData = `${nftId}_${share ? share : "0"}`
  const signature = getSignature(keyring, secretData)

  return {
    account_address: keyring.address,
    secret_data: secretData,
    signature,
  }
}

/**
 * @name sgxApiPost
 * @summary             TODO
 * @param baseUrl       TODO
 * @param secretPayload TODO
 * @returns             TODO
 */
export const sgxApiPost = async (url: string, secretPayload: SecretPayload): Promise<any> => {
  try {
    const res = await axios.request({
      method: "post",
      url,
      headers: {
        "Content-Type": "application/json",
      },
      data: secretPayload,
    })
    return res.data
  } catch (err: any) {
    throw new Error(err)
  }
}

export const retryPost = async (fn: () => Promise<any>, n: number): Promise<any> => {
  let lastError: any

  for (let i = 0; i < n; i++) {
    try {
      console.log("RETRY:", i)
      return await fn()
    } catch (e) {
      lastError = {
        ...(e as Error),
      }
    }
  }

  return lastError
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
  const sgxRes = await Promise.all(
    shares.map(async (share, idx) => {
      const secretPayload = formatPayload(nftId, share, keyring)

      const enclaveUrl = `${sgxEnclaves[idx]}${SGX_STORE_ENDPOINT}`
      const post = () => sgxApiPost(enclaveUrl, secretPayload)
      return await retryPost(post, 3)
    }),
  )

  return sgxRes
}

/**
 * @name sgxSSSSharesRetrieve
 * @summary             TODO
 * @param nftId       TODO
 * @param keyring       TODO
 * @returns             TODO
 */
export const sgxSSSSharesRetrieve = async (nftId: number, keyring: IKeyringPair) => {
  const sgxEnclaves = await getSgxEnclaves()
  const shares = await Promise.all(
    sgxEnclaves.map(async (sgxEnclaveBaseUrl) => {
      const secretPayload = formatPayload(nftId, null, keyring)
      const enclaveUrl = `${sgxEnclaveBaseUrl}${SGX_RETRIEVE_ENDPOINT}`
      const res = await sgxApiPost(enclaveUrl, secretPayload)
      return res.secret_data.split("_")[1]
    }),
  )
  return shares
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
