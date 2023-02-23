// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { combine, split } from "shamirs-secret-sharing"
import { IKeyringPair } from "@polkadot/types/types"
import { hexToString } from "@polkadot/util"

import { getSignature } from "./crypto"
import { HttpClient } from "./http"
import { RetrievePayloadType, StorePayloadType, TeeStoreDataResponseType, TeeRetrieveDataResponseType } from "./types"
import { ensureHttps, removeURLSlash, retryPost } from "./utils"

import { getClusterData, getEnclaveData } from "../tee"
import { Errors } from "../constants"
import { EnclaveHealthType } from "tee/types"

export const SSSA_NUMSHARES = 5
export const SSSA_THRESHOLD = 3

export const TEE_HEALTH_ENDPOINT = "/api/health"
export const TEE_STORE_NFT_ENDPOINT = "/api/secret-nft/store-keyshare"
export const TEE_RETRIEVE_NFT_ENDPOINT = "/api/secret-nft/retrieve-keyshare"
export const TEE_STORE_CAPSULE_ENDPOINT = "/api/capsule-nft/set-keyshare"
export const TEE_RETRIEVE_CAPSULE_ENDPOINT = "/api/capsule-nft/retrieve-keyshare"

export const SIGNER_BLOCK_VALIDITY = 100

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
  const filteredShares = shares.filter((x) => x)
  if (filteredShares.length < SSSA_THRESHOLD)
    throw new Error(
      `${Errors.TEE_RETRIEVE_ERROR} - CANNOT_COMBINE_SHARES: expected a minimum of ${SSSA_THRESHOLD} shares.`,
    )
  const hexShares = filteredShares.map((bufferShare) => Buffer.from(bufferShare, "base64").toString("hex"))
  const combinedShares = combine(hexShares)
  return combinedShares.toString("utf8")
}

/**
 * @name getEnclaveHealthStatus
 * @summary           Check that all TEE enclaves from a cluster are ready to be used.
 * @param clusterId   The TEE Cluster id.
 * @returns           An array of JSONs containing each enclave information (status, date, description, addresses)
 */
export const getEnclaveHealthStatus = async (clusterId = 0) => {
  const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
  const clusterHealthCheck = await Promise.all(
    teeEnclaves.map(async (enclaveUrl, idx) => {
      const http = new HttpClient(ensureHttps(enclaveUrl))
      const enclaveData: EnclaveHealthType = await http.get(TEE_HEALTH_ENDPOINT)
      if (enclaveData.status !== 200) {
        throw new Error(`${Errors.TEE_ENCLAVE_NOT_AVAILBLE} - CANNOT_REACH_ENCLAVE ${idx}: ${enclaveUrl}`)
      }
      return enclaveData
    }),
  )
  return clusterHealthCheck
}

/**
 * @name getTeeEnclavesBaseUrl
 * @summary           Retrieves the TEE enclaves urls stored on-chain.
 * @param clusterId   The TEE Cluster id.
 * @returns           An array of the TEE enclaves urls available.
 */
export const getTeeEnclavesBaseUrl = async (clusterId = 0) => {
  const clusterData = await getClusterData(clusterId)
  if (!clusterData) throw new Error(Errors.TEE_CLUSTER_NOT_FOUND)
  const urls: string[] = await Promise.all(
    clusterData.map(async (enclave) => {
      const enclaveData = await getEnclaveData(enclave)
      if (!enclaveData) throw new Error(Errors.TEE_ENCLAVE_NOT_FOUND)
      return removeURLSlash(hexToString(enclaveData.apiUri))
    }),
  )
  return urls
}

/**
 * @name formatStorePayload
 * @summary                     Prepares post request payload to store secret/capsule NFT data into TEE enclaves.
 * @param ownerAddress          Address of the NFT's owner.
 * @param signerAuthMessage     The message to be signed by the owner to autenticate the tempory signer used to sign shares.
 * @param signerAuthSignature   The signerAuthMessage message signed by the NFT owner.
 * @param signerPair            The temporary signer account used to sign shares.
 * @param nftId                 The ID of the NFT.
 * @param share                 A share of the private key used to decrypt the NFT.
 * @param blockId               The current block header id on-chain.
 * @param blockValidity         A block duration validity for the temporay signer account to be valid; default SIGNER_BLOCK_VALIDITY = 100 blocks.
 * @returns                     Payload object ready to be submitted to TEE enclaves.
 */
export const formatStorePayload = (
  ownerAddress: string,
  signerAuthMessage: string,
  signerAuthSignature: string,
  signerPair: IKeyringPair,
  nftId: number,
  share: string,
  blockId: number,
  blockValidity = SIGNER_BLOCK_VALIDITY,
): StorePayloadType => {
  const secretData = `${nftId}_${share}_${blockId}_${blockValidity}`
  const secretDataSignature = getSignature(signerPair, secretData)
  return {
    owner_address: ownerAddress,
    signer_address: signerAuthMessage,
    secret_data: secretData,
    signature: secretDataSignature,
    signersig: signerAuthSignature,
  }
}

/**
 * @name formatRetrievePayload
 * @summary               Prepares post request payload to retrieve secret/capsule NFT data into TEE enclaves.
 * @param ownerPair       The NFT owner account used to sign data.
 * @param nftId           The ID of the NFT.
 * @param blockId         The current block header id on-chain.
 * @param blockValidity   A block duration validity for the temporay signer account to be valid; default SIGNER_BLOCK_VALIDITY = 100 blocks.
 * @returns               Payload ready to be submitted to TEE enclaves.
 */
export const formatRetrievePayload = (
  ownerPair: IKeyringPair,
  nftId: number,
  blockId: number,
  blockValidity = SIGNER_BLOCK_VALIDITY,
): RetrievePayloadType => {
  const data = `${nftId}_${blockId}_${blockValidity}`
  const signature = getSignature(ownerPair, data)
  return {
    owner_address: ownerPair.address,
    data,
    signature,
  }
}

/**
 * @name teeUpload
 * @summary               Upload secret payload data to an TEE enclave.
 * @param http            HttpClient instance.
 * @param endpoint        TEE enclave endpoint.
 * @param secretPayload   Payload formatted with the required secret NFT's data.
 * @returns               TEE enclave response.
 */
export const teeUpload = async <T, K>(http: HttpClient, endpoint: string, secretPayload: T): Promise<K> => {
  const headers = {
    "Content-Type": "application/json",
  }
  return http.post<K>(endpoint, secretPayload, {
    headers,
  })
}

/**
 * @name teeSSSSharesUpload
 * @summary               Upload secret shares to TEE enclaves with retry.
 * @param clusterId       The TEE Cluster id to upload shares to.
 * @param kind            The kind of nft linked to the key uploaded: "secret" or "capsule"
 * @param payloads        Array of payloads containing secret data and each share of the private key. Should contain *SSSA_NUMSHARES* payloads.
 * @param nbRetry         The number of retry that need to be proceeded in case of fail during a share upload. Default is 3.
 * @param enclavesIndex   Optional: An Array of enclaves index. For example, some enclaves that previously failed that need to be uploaded again.
 * @returns               TEE enclave response including both the payload and the enclave response.
 */
export const teeSSSSharesUpload = async (
  //todo: rename upload to store
  clusterId = 0,
  kind: "secret" | "capsule",
  payloads: StorePayloadType[],
  nbRetry = 3,
  enclavesIndex?: number[],
) => {
  if (kind !== "secret" && kind !== "capsule") {
    throw new Error(`${Errors.TEE_UPLOAD_ERROR} : Kind must be either "secret" or "capsule"`)
  }
  const nbShares =
    enclavesIndex && enclavesIndex.length > 0 && enclavesIndex.length <= SSSA_NUMSHARES
      ? enclavesIndex.length
      : SSSA_NUMSHARES
  if (payloads.length !== nbShares)
    throw new Error(`${Errors.NOT_CORRECT_AMOUNT_TEE_PAYLOADS} - Got: ${payloads.length}; Expected: ${SSSA_NUMSHARES}`)
  const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
  if (teeEnclaves.length !== SSSA_NUMSHARES)
    throw new Error(
      `${Errors.NOT_CORRECT_AMOUNT_TEE_ENCLAVES} - Got: ${teeEnclaves.length}; Expected: ${SSSA_NUMSHARES}`,
    )
  const teeRes = await Promise.all(
    payloads.map(async (payload, idx) => {
      const baseUrl = teeEnclaves[enclavesIndex && enclavesIndex.length > 0 ? enclavesIndex[idx] : idx]
      const http = new HttpClient(ensureHttps(baseUrl))
      const endpoint = kind === "secret" ? TEE_STORE_NFT_ENDPOINT : TEE_STORE_CAPSULE_ENDPOINT
      const post = async () => await teeUpload<StorePayloadType, TeeStoreDataResponseType>(http, endpoint, payload)
      return await retryPost<TeeStoreDataResponseType | Error>(post, nbRetry)
    }),
  )

  return teeRes.map((enclaveRes, i) => {
    return {
      ...payloads[i],
      ...enclaveRes,
    }
  })
}

/**
 * @name teeSSSSharesRetrieve
 * @summary           Get secret data shares from TEE enclaves.
 * @param clusterId   The TEE Cluster id to upload shares to.
 * @param kind        The kind of nft linked to the key being retrieved: "secret" or "capsule"
 * @param payload     The payload containing secret NFT data, the keyring address and the signature. You can use our formatPayload() function.
 * @returns           TEE enclave response.
 */
export const teeSSSSharesRetrieve = async (
  clusterId: number,
  kind: "secret" | "capsule",
  payload: RetrievePayloadType,
): Promise<string[]> => {
  if (kind !== "secret" && kind !== "capsule") {
    throw new Error(`${Errors.TEE_RETRIEVE_ERROR} : Kind must be either "secret" or "capsule"`)
  }
  const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
  if (teeEnclaves.length !== SSSA_NUMSHARES)
    throw new Error(
      `${Errors.NOT_CORRECT_AMOUNT_TEE_ENCLAVES} - Got: ${teeEnclaves.length}; Expected: ${SSSA_NUMSHARES}`,
    )
  const dataFieldName = kind === "secret" ? "keyshare_data" : "secret_data"
  const shares = await Promise.all(
    teeEnclaves.map(async (baseUrl) => {
      const secretPayload = payload
      const http = new HttpClient(ensureHttps(baseUrl))
      const endpoint = kind === "secret" ? TEE_RETRIEVE_NFT_ENDPOINT : TEE_RETRIEVE_CAPSULE_ENDPOINT
      const res = await teeUpload<RetrievePayloadType, TeeRetrieveDataResponseType>(http, endpoint, secretPayload)
      return res[dataFieldName]?.split("_")[1] ?? ""
    }),
  )
  return shares.filter((x) => x)
}
