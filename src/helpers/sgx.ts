// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { combine, split } from "shamirs-secret-sharing"
import { IKeyringPair } from "@polkadot/types/types"

import { getSignature } from "./crypto"
import { HttpClient } from "./http"
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
 * @name getSgxEnclaves
 * @summary   Retrieves the SGX enclaves endpoint stored on-chain.
 * @returns   An array of the SGX enclaves endpoints available.
 */
export const getSgxEnclaves = async () => {
  // TODO: query storage to chain
  return ["https://worker-ca-0.trnnfr.com"]
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
 * @summary         Upload secret shares to SGX enclaves with retry.
 * @param http      HttpClient instance.
 * @param shares    Array of stringified shares.
 * @param nftId     The ID of the secret NFT.
 * @param keyring   Account of the secret NFT's owner.
 * @returns         SGX enclave response.
 */
export const sgxSSSSharesUpload = async (http: HttpClient, shares: string[], nftId: number, keyring: IKeyringPair) => {
  const sgxEnclaves = await getSgxEnclaves()
  const sgxRes = await Promise.all(
    shares.map(async (share, idx) => {
      const secretPayload = formatPayload(nftId, share, keyring)
      const enclaveEndpoint = `${sgxEnclaves[idx]}${SGX_STORE_ENDPOINT}`
      const post = () => sgxUpload(http, enclaveEndpoint, secretPayload)
      return await retryPost<SgxDataResponseType | Error>(post, 3)
    }),
  )

  return sgxRes
}

/**
 * @name sgxSSSSharesRetrieve
 * @summary         Get secret data shares from SGX enclaves.
 * @param http      HttpClient instance.
 * @param nftId     The ID of the secret NFT.
 * @param keyring   Account of the secret NFT's owner.
 * @returns         SGX enclave response.
 */
export const sgxSSSSharesRetrieve = async (http: HttpClient, nftId: number, keyring: IKeyringPair) => {
  const sgxEnclaves = await getSgxEnclaves()
  const shares = await Promise.all(
    sgxEnclaves.map(async (sgxEnclaveBaseUrl) => {
      const secretPayload = formatPayload(nftId, null, keyring)
      const enclaveEndpoint = `${sgxEnclaveBaseUrl}${SGX_RETRIEVE_ENDPOINT}`
      const res = await sgxUpload(http, enclaveEndpoint, secretPayload)
      return res.secret_data?.split("_")[1]
    }),
  )
  return shares
}
