// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { combine, split } from "shamirs-secret-sharing"
import { IKeyringPair } from "@polkadot/types/types"

import { Errors } from "../constants"

import { getSignature } from "./crypto"
import { HttpClient } from "./http"
import { getClusterData, getEnclaveData } from "../sgx"
import { SecretPayloadType, SgxDataResponseType } from "./types"
import { retryPost } from "./utils"

export const SSSA_NUMSHARES = 5
export const SSSA_THRESHOLD = 3

export const SGX_STORE_ENDPOINT = "/api/nft/storeSecretShares"
export const SGX_RETRIEVE_ENDPOINT = "/api/nft/retrieveSecretShares"

/**
 * @name generateSSSShares
 * @summary     Generates an array of shares from the incoming parameter string.
 * @param data  The data to split into shares (e.g. private key).
 * @returns     An array of stringified shares.
 */
export const generateSSSShares = (data: string): string[] => {
  const shares = split(data, {
    shares: SSSA_NUMSHARES,
    threshold: SSSA_THRESHOLD,
  })
  const base64shares: string[] = shares.map((bufferShare: any) => bufferShare.toString("base64"))

  return base64shares
}

/**
 * @name combineSSSShares
 * @summary       Combines an array of shares to reconstruct data.
 * @param shares  Array of stringified shares.
 * @returns       The original data reconstructed.
 */
export const combineSSSShares = (shares: string[]): string => {
  const hexShares = shares.map((bufferShare) => Buffer.from(bufferShare, "base64").toString("hex"))
  const combinedShares = combine(hexShares)
  return combinedShares.toString("utf8")
}

/**
 * @name getSgxEnclavesBaseUrl
 * @summary           Retrieves the SGX enclaves urls stored on-chain.
 * @param clusterId   The SGX Cluster id.
 * @returns           An array of the SGX enclaves urls available.
 */
export const getSgxEnclavesBaseUrl = async (clusterId = 0) => {
  // TODO: check query storage to chain
  const clusterData = await getClusterData(clusterId)

  if (!clusterData) throw new Error(Errors.SGX_CLUSTER_NOT_FOUND)
  let urls=[]
  for (let i = 0; i < clusterData.length; i++) {
    const enclaveData = await getEnclaveData(clusterData[i])
    if(enclaveData){
      urls.push(enclaveData)
    }
  }
  // const urls: string[] = await Promise.all(
  //   clusterData.map(async ({enclaveAddressId}) => {
  //     const enclaveData = await getEnclaveData(enclaveAddressId)
  //     if (!enclaveData) throw new Error(Errors.SGX_ENCLAVE_NOT_FOUND)
  //     return enclaveData.apiUri
  //   }),
  // )

  return urls
}

/**
 * @name formatPayload
 * @summary         Prepares post request payload to store secret NFT data into SGX enclaves.
 * @param nftId     The ID of the secret NFT.
 * @param share     A share of the private key used to decrypt the secret NFT.
 * @param keyring   Account of the secret NFT's owner.
 * @returns         Payload ready to be submitted to SGX enclaves.
 */
export const formatPayload = (nftId: number, share: string | null, keyring: IKeyringPair): SecretPayloadType => {
  const secretData = `${nftId}_${share ? share : "0"}` //TODO: remove null type allowance once SGX API supports '_...'
  const signature = getSignature(keyring, secretData)

  return {
    account_address: keyring.address,
    secret_data: secretData,
    signature,
  }
}

/**
 * @name sgxUpload
 * @summary               Upload secret payload data to an SGX enclave.
 * @param http            HttpClient instance.
 * @param endpoint        SGX enclave endpoint.
 * @param secretPayload   Payload formatted with the required secret NFT's data.
 * @returns               SGX enclave response.
 */
export const sgxUpload = async (
  http: HttpClient,
  endpoint: string,
  secretPayload: SecretPayloadType,
): Promise<SgxDataResponseType> => {
  const headers = {
    "Content-Type": "application/json",
  }
  return http.post<SgxDataResponseType>(endpoint, secretPayload, {
    headers,
  })
}

/**
 * @name sgxSSSSharesUpload
 * @summary           Upload secret shares to SGX enclaves with retry.
 * @param clusterId   The SGX Cluster id to upload shares to.
 * @param payloads    Array of payloads containing secret NFT data and each share of the private key. Should contain *SSSA_NUMSHARES* payloads.
 * @returns           SGX enclave response.
 */
export const sgxSSSSharesUpload = async (clusterId = 0, payloads: SecretPayloadType[]) => {
  if (payloads.length !== SSSA_NUMSHARES)
    throw new Error(`${Errors.NOT_CORRECT_AMOUNT_SGX_PAYLOADS} - Got: ${payloads.length}; Expected: ${SSSA_NUMSHARES}`)
  const sgxEnclaves = await getSgxEnclavesBaseUrl(clusterId)
  if (sgxEnclaves.length !== SSSA_NUMSHARES)
    throw new Error(
      `${Errors.NOT_CORRECT_AMOUNT_SGX_ENCLAVES} - Got: ${sgxEnclaves.length}; Expected: ${SSSA_NUMSHARES}`,
    )
  const sgxRes = await Promise.all(
    payloads.map(async (payload, idx) => {
      const baseUrl = sgxEnclaves[idx]
      const http = new HttpClient(baseUrl)
      const post = () => sgxUpload(http, SGX_STORE_ENDPOINT, payload)
      return await retryPost<SgxDataResponseType | Error>(post, 3)
    }),
  )

  return sgxRes
}

/**
 * @name sgxSSSSharesRetrieve
 * @summary           Get secret data shares from SGX enclaves.
 * @param clusterId   The SGX Cluster id to upload shares to.
 * @param payloads    Array of payloads containing secret NFT data and each share of the private key. Should contain *SSSA_NUMSHARES* payloads.
 * @returns           SGX enclave response.
 */
export const sgxSSSSharesRetrieve = async (clusterId = 0, payloads: SecretPayloadType[]) => {
  if (payloads.length !== SSSA_NUMSHARES)
    throw new Error(`${Errors.NOT_CORRECT_AMOUNT_SGX_PAYLOADS} - Got: ${payloads.length}; Expected: ${SSSA_NUMSHARES}`)
  const sgxEnclaves = await getSgxEnclavesBaseUrl(clusterId)
  if (sgxEnclaves.length !== SSSA_NUMSHARES)
    throw new Error(
      `${Errors.NOT_CORRECT_AMOUNT_SGX_ENCLAVES} - Got: ${sgxEnclaves.length}; Expected: ${SSSA_NUMSHARES}`,
    )
  const shares = await Promise.all(
    sgxEnclaves.map(async (baseUrl, idx) => {
      const payload = payloads[idx]
      const http = new HttpClient(baseUrl)
      const res = await sgxUpload(http, SGX_RETRIEVE_ENDPOINT, payload)
      return res.secret_data?.split("_")[1]
    }),
  )
  return shares
}
