// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { combine, split } from "shamirs-secret-sharing"
import { IKeyringPair } from "@polkadot/types/types"
import { hexToString } from "@polkadot/util"

import { getSignature } from "./crypto"
import { HttpClient } from "./http"
import { SecretPayloadType, TeeDataResponseType } from "./types"
import { ensureHttps, removeURLSlash, retryPost } from "./utils"

import { getClusterData, getEnclaveData } from "../tee"
import { Errors } from "../constants"
import { EnclaveHealthType } from "tee/types"

export const SSSA_NUMSHARES = 5
export const SSSA_THRESHOLD = 3

export const TEE_STORE_ENDPOINT = "/api/nft/storeSecretShares"
export const TEE_RETRIEVE_ENDPOINT = "/api/nft/retrieveSecretShares"
export const TEE_HEALTH_ENDPOINT = "/health"

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
  const hexShares = shares.map((bufferShare) => Buffer.from(bufferShare, "base64").toString("hex"))
  const combinedShares = combine(hexShares)
  return combinedShares.toString("utf8")
}

/**
 * @name getEnclaveHealthStatus
 * @summary           Check that all TEE enclaves from a cluster are ready to be used.
 * @param clusterId   The TEE Cluster id.
 * @returns           Besoin de retourner quelque chose ? Un boolean ? Les status 200 ?
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
 * @name formatPayload
 * @summary         Prepares post request payload to store secret NFT data into TEE enclaves.
 * @param nftId     The ID of the secret NFT.
 * @param share     A share of the private key used to decrypt the secret NFT.
 * @param keyring   Account of the secret NFT's owner.
 * @returns         Payload ready to be submitted to TEE enclaves.
 */
export const formatPayload = (
  owner: IKeyringPair,
  signer: IKeyringPair,
  nftId: number,
  share: string,
  blockId: number,
  blockValidity = SIGNER_BLOCK_VALIDITY,
): SecretPayloadType => {
  const targetBlockId = blockId + blockValidity

  const signerAddressToSign = `<Bytes>${signer.address}_${targetBlockId}</Bytes>` // todo: removed <Bytes> when the API is clean
  const signersig = getSignature(owner, signerAddressToSign)

  const secretData = `<Bytes>${nftId}_${share}_${blockId}_${blockValidity}</Bytes>` // todo: removed <Bytes> when the API is clean + blockId & blockValidity merged into targetBlockId like in signerAddressToSign
  const signature = getSignature(signer, secretData)

  return {
    owner_address: owner.address,
    signer_address: signerAddressToSign,
    secret_data: secretData,
    signature,
    signersig,
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
export const teeUpload = async (
  http: HttpClient,
  endpoint: string,
  secretPayload: SecretPayloadType,
): Promise<TeeDataResponseType> => {
  const headers = {
    "Content-Type": "application/json",
  }
  return http.post<TeeDataResponseType>(endpoint, secretPayload, {
    headers,
  })
}

/**
 * @name teeSSSSharesUpload
 * @summary               Upload secret shares to TEE enclaves with retry.
 * @param clusterId       The TEE Cluster id to upload shares to.
 * @param payloads        Array of payloads containing secret NFT data and each share of the private key. Should contain *SSSA_NUMSHARES* payloads.
 * @param nbRetry         The number of retry that need to be proceeded in case of fail during a share upload. Default is 3.
 * @param enclavesIndex   Optional: An Array of enclaves index. For example, some enclaves that previously failed that need to be uploaded again.
 * @returns               TEE enclave response including both the payload and the enclave response.
 */
export const teeSSSSharesUpload = async (
  clusterId = 0,
  payloads: SecretPayloadType[],
  nbRetry = 3,
  enclavesIndex?: number[],
) => {
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
      const post = async () => await teeUpload(http, TEE_STORE_ENDPOINT, payload)
      return await retryPost<TeeDataResponseType | Error>(post, nbRetry)
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
 * @param payload     The payload containing secret NFT data, the keyring address and the signature. You can use our formatPayload() function.
 * @returns           TEE enclave response.
 */
export const teeSSSSharesRetrieve = async (clusterId: number, payload: SecretPayloadType): Promise<string[]> => {
  const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
  if (teeEnclaves.length !== SSSA_NUMSHARES)
    throw new Error(
      `${Errors.NOT_CORRECT_AMOUNT_TEE_ENCLAVES} - Got: ${teeEnclaves.length}; Expected: ${SSSA_NUMSHARES}`,
    )
  const shares = await Promise.all(
    teeEnclaves.map(async (baseUrl) => {
      const secretPayload = payload
      const http = new HttpClient(ensureHttps(baseUrl))
      const res = await teeUpload(http, TEE_RETRIEVE_ENDPOINT, secretPayload)
      return res.secret_data?.split("_")[1] as string
    }),
  )
  return shares
}
