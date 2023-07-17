// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { create, combine } from "sssa-js"
import { Buffer } from "buffer"
import { IKeyringPair } from "@polkadot/types/types"
import { hexToString } from "@polkadot/util"

import { getSignatureFromExtension, getSignatureFromKeyring } from "./crypto"
import { HttpClient } from "./http"
import {
  RetrievePayloadType,
  StorePayloadType,
  TeeGenericDataResponseType,
  TeeRetrieveDataResponseType,
  TeeSharesStoreType,
  TeeSharesRemoveType,
  RequesterType,
} from "./types"
import { ensureHttps, removeURLSlash, retryPost } from "./utils"

import { getClusterData, getEnclaveData } from "../tee"
import { Errors } from "../constants"
import {
  EnclaveDataAndHealthType,
  EnclaveHealthType,
  NFTShareAvailableType,
  PopulatedEnclavesDataType,
} from "tee/types"
// import { EnclaveHealthType, EnclaveQuoteRawType, EnclaveQuoteType, NFTShareAvailableType } from "tee/types"
import { isValidAddress } from "../blockchain"

export const SSSA_NUMSHARES = 5
export const SSSA_THRESHOLD = 3

const TEE_STORE_STATUS_SUCCESS = "STORESUCCESS"
const TEE_RETRIEVE_STATUS_SUCCESS = "RETRIEVESUCCESS"
export const TEE_HEALTH_ENDPOINT = "/api/health"
// export const TEE_QUOTE_ENDPOINT = "/api/quote"
export const TEE_STORE_SECRET_NFT_ENDPOINT = "/api/secret-nft/store-keyshare"
export const TEE_RETRIEVE_SECRET_NFT_ENDPOINT = "/api/secret-nft/retrieve-keyshare"
export const TEE_REMOVE_SECRET_NFT_KEYSHARE_ENDPOINT = "/api/secret-nft/remove-keyshare"
export const TEE_AVAILABLE_SECRET_NFT_KEYSHARE_ENDPOINT = (nftId: number) =>
  `/api/secret-nft/is-keyshare-available/${nftId}`
export const TEE_STORE_CAPSULE_NFT_ENDPOINT = "/api/capsule-nft/set-keyshare"
export const TEE_RETRIEVE_CAPSULE_NFT_ENDPOINT = "/api/capsule-nft/retrieve-keyshare"
export const TEE_REMOVE_CAPSULE_NFT_KEYSHARE_ENDPOINT = "/api/capsule-nft/remove-keyshare"
export const TEE_AVAILABLE_CAPSULE_NFT_KEYSHARE_ENDPOINT = (nftId: number) =>
  `/api/capsule-nft/is-keyshare-available/${nftId}`

export const SIGNER_BLOCK_VALIDITY = 15

/**
 * @name generateKeyShares
 * @summary     Generates an array of shares from the incoming parameter string.
 * @param data  The data to split into shares (e.g. private key).
 * @returns     An array of stringified shares.
 */
export const generateKeyShares = (data: string): string[] => {
  const shares = create(SSSA_THRESHOLD, SSSA_NUMSHARES, data)
  const base64shares: string[] = shares.map((share: string) => Buffer.from(share).toString("base64"))
  return base64shares
}

/**
 * @name combineKeyShares
 * @summary       Combines an array of shares to reconstruct data.
 * @param shares  Array of stringified shares.
 * @returns       The original data reconstructed.
 */
export const combineKeyShares = (shares: string[]): string => {
  const filteredShares = shares.filter((x) => x)
  if (filteredShares.length < SSSA_THRESHOLD)
    throw new Error(
      `${Errors.TEE_RETRIEVE_ERROR} - CANNOT_COMBINE_SHARES: expected a minimum of ${SSSA_THRESHOLD} shares.`,
    )
  const hexShares = filteredShares.map((bufferShare) => Buffer.from(bufferShare, "base64").toString("utf-8"))
  const combinedShares = combine(hexShares)
  return combinedShares
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
        throw new Error(
          `${Errors.TEE_ENCLAVE_NOT_AVAILBLE} - CANNOT_REACH_ENCLAVE_ID ${idx}: ${enclaveData.description} - URL: ${enclaveUrl}`,
        )
      }
      return enclaveData
    }),
  )
  return clusterHealthCheck
}

/**
 * @name populateEnclavesData
 * @summary           Populate enclaves data with addresses, slot and urls.
 * @param clusterId   The TEE Cluster id.
 * @returns           An array of the TEE enclaves data for the cluster.
 */
export const populateEnclavesData = async (clusterId = 0) => {
  const clusterData = await getClusterData(clusterId)
  if (!clusterData) throw new Error(Errors.TEE_CLUSTER_NOT_FOUND)
  const data: PopulatedEnclavesDataType[] = await Promise.all(
    clusterData.enclaves.map(async (enclave) => {
      const enclaveData = await getEnclaveData(enclave[0])
      if (!enclaveData) throw new Error(Errors.TEE_ENCLAVE_NOT_FOUND)
      return {
        clusterId,
        clusterType: clusterData.isPublic ? "Public" : "Private",
        enclaveAddress: enclaveData.enclaveAddress,
        operatorAddress: enclave[0],
        enclaveUrl: removeURLSlash(hexToString(enclaveData.apiUri)),
        enclaveSlot: enclave[1],
      }
    }),
  )
  return data
}

/**
 * @name getEnclaveDataAndHealth
 * @summary           Get the enclaves data from a cluster populated with health check.
 * @param clusterId   The TEE Cluster id.
 * @returns           An array of JSONs containing each enclave data populated with its health information.
 */
export const getEnclaveDataAndHealth = async (clusterId = 0): Promise<EnclaveDataAndHealthType[]> => {
  const teeEnclaves = await populateEnclavesData(clusterId)
  const enclaveData = await Promise.all(
    teeEnclaves.map(async (e, idx) => {
      try {
        const http = new HttpClient(ensureHttps(e.enclaveUrl))
        const enclaveData: EnclaveHealthType = await http.get(TEE_HEALTH_ENDPOINT)
        const { date, status, description } = enclaveData
        return { ...e, status, description, date }
      } catch (error) {
        const date = new Date().toJSON()
        const description =
          error instanceof Error ? `SGX_SERVER_ERROR - ${error.message}` : "SGX_SERVER_ERROR - ENCLAVE UNREACHABLE"
        return { ...teeEnclaves[idx], status: 500, description, date }
      }
    }),
  )
  return enclaveData
}

// /**
//  * @name getEnclavesQuote
//  * @summary           Generate the enclaves quote.
//  * @param clusterId   The TEE Cluster id.
//  * @returns           An array of JSONs containing each enclave quote information (status, data or error)
//  */
// export const getEnclavesQuote = async (clusterId = 0) => {
//   const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
//   const clusterQuote = await Promise.all(
//     teeEnclaves.map(async (enclaveUrl, idx) => {
//       const http = new HttpClient(ensureHttps(enclaveUrl))
//       const enclaveData: EnclaveQuoteRawType = await http.get(TEE_QUOTE_ENDPOINT)
//       if (enclaveData.status !== "Success" && "error" in enclaveData) {
//         throw new Error(
//           `${Errors.TEE_ENCLAVE_NOT_AVAILBLE} - ENCLAVE_ID ${idx}: ${enclaveData.error} - URL: ${enclaveUrl}`,
//         )
//       }
//       return { ...enclaveData, enclaveUrl }
//     }),
//   )
//   return clusterQuote as EnclaveQuoteType[]
// }

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
    clusterData.enclaves.map(async (enclave) => {
      const enclaveData = await getEnclaveData(enclave[0]) // not working with Alphanet
      if (!enclaveData) throw new Error(Errors.TEE_ENCLAVE_NOT_FOUND)
      return removeURLSlash(hexToString(enclaveData?.apiUri))
    }),
  )
  return urls
}

/**
 * @name getEnclaveSharesAvailablility
 * @summary           Check that an enclave from a cluster have registered a Capsule NFT or a Secret NFT's key shares
 * @param enclave     The enclave base url.
 * @param nftId       The Capsule NFT id or Secret NFT id to check key registration on enclave.
 * @param kind        The kind of NFT linked to the key being checked: "secret" or "capsule"
 * @returns           A JSON containing the enclave share availability (enclave_id, nft_id, an exists status (boolean))
 */
export const getTeeEnclaveSharesAvailablility = async (enclave: string, nftId: number, kind: "secret" | "capsule") => {
  if (kind !== "secret" && kind !== "capsule") {
    throw new Error(`${Errors.TEE_ERROR}: Kind must be either "secret" or "capsule"`)
  }
  const http = new HttpClient(ensureHttps(enclave))
  const endpoint =
    kind === "secret"
      ? TEE_AVAILABLE_SECRET_NFT_KEYSHARE_ENDPOINT(nftId)
      : TEE_AVAILABLE_CAPSULE_NFT_KEYSHARE_ENDPOINT(nftId)
  return await http.get<NFTShareAvailableType>(endpoint)
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
  const data = `<Bytes>${nftId}_${share}_${blockId}_${blockValidity}</Bytes>`
  const dataSignature = getSignatureFromKeyring(signerPair, data)
  return {
    owner_address: ownerAddress,
    signer_address: signerAuthMessage,
    data,
    signature: dataSignature,
    signersig: signerAuthSignature,
  }
}

/**
 * @name formatRetrievePayload
 * @summary                  Prepares post request payload to retrieve secret/capsule NFT data into TEE enclaves.
 * @param requester          The NFT owner account (keyring) or address (string) used to sign data. It can also be the retriever account of rentee or delegatee.
 * @param requesterRole      Kind of account that want to retrieve the payload: it can be either "OWNER", "DELEGATEE" or "RENTEE"
 * @param nftId              The ID of the NFT.
 * @param blockId            The current block header id on-chain.
 * @param blockValidity      A block duration validity for the temporay signer account to be valid; default SIGNER_BLOCK_VALIDITY = 100 blocks.
 * @param extensionInjector  (Optional)The signer method retrived from your extension. We recommand Polkadot extention: object must have a signer key.
 * @returns                  Payload ready to be submitted to TEE enclaves.
 */
export const formatRetrievePayload = async (
  requester: IKeyringPair | string,
  requesterRole: RequesterType,
  nftId: number,
  blockId: number,
  blockValidity = SIGNER_BLOCK_VALIDITY,
  extensionInjector?: Record<string, any>,
): Promise<RetrievePayloadType> => {
  if (typeof requester === "string" && !isValidAddress(requester)) throw new Error("INVALID_ADDRESS_FORMAT")
  if (typeof requester === "string" && !extensionInjector)
    throw new Error(
      `${Errors.TEE_RETRIEVE_ERROR} - INJECTOR_SIGNER_MISSING : injectorSigner must be provided when signer is of type string`,
    )
  const data = `<Bytes>${nftId}_${blockId}_${blockValidity}</Bytes>`
  const signature =
    typeof requester === "string"
      ? extensionInjector && (await getSignatureFromExtension(requester, extensionInjector, data))
      : getSignatureFromKeyring(requester, data)

  if (!signature) throw new Error(`${Errors.TEE_RETRIEVE_ERROR} : cannot get signature when retrieving payload`)
  return {
    requester_address: typeof requester === "string" ? requester : requester.address,
    requester_type: requesterRole,
    data,
    signature,
  }
}

/**
 * @name TeePost
 * @summary               Upload secret payload data to an TEE enclave.
 * @param http            HttpClient instance.
 * @param endpoint        TEE enclave endpoint.
 * @param secretPayload   Payload formatted with the required secret NFT's data.
 * @returns               TEE enclave response.
 */
export const TeePost = async <T, K>(http: HttpClient, endpoint: string, secretPayload: T): Promise<K> => {
  const headers = {
    "Content-Type": "application/json",
  }
  return http.post<K>(endpoint, secretPayload, {
    headers,
  })
}

/**
 * @name teeKeySharesStore
 * @summary               Upload secret shares to TEE enclaves with retry.
 * @param clusterId       The TEE Cluster id to upload shares to.
 * @param kind            The kind of nft linked to the key uploaded: "secret" or "capsule"
 * @param payloads        Array of payloads containing secret data and each share of the private key. Should contain *SSSA_NUMSHARES* payloads.
 * @param nbRetry         The number of retry that need to be proceeded in case of fail during a share upload. Default is 3.
 * @param enclavesIndex   Optional: An Array of enclaves index. For example, some enclaves that previously failed that need to be uploaded again.
 * @returns               TEE enclave response including both the payload and the enclave response.
 */
export const teeKeySharesStore = async (
  clusterId = 0,
  kind: "secret" | "capsule",
  payloads: StorePayloadType[],
  nbRetry = 3,
  enclavesIndex?: number[],
): Promise<TeeSharesStoreType[]> => {
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
      const endpoint = kind === "secret" ? TEE_STORE_SECRET_NFT_ENDPOINT : TEE_STORE_CAPSULE_NFT_ENDPOINT
      const post = async () => await TeePost<StorePayloadType, TeeGenericDataResponseType>(http, endpoint, payload)
      return await retryPost<TeeGenericDataResponseType>(post, nbRetry)
    }),
  )

  return teeRes.map((enclaveRes, i) => {
    const payload = payloads[i]

    if ("isRetryError" in enclaveRes)
      return {
        status: enclaveRes.status,
        description: enclaveRes.message,
        nft_id: Number(payload.data.split("_")[0]),
        isError: true,
        ...payload,
      }

    return {
      ...enclaveRes,
      isError: enclaveRes.status !== TEE_STORE_STATUS_SUCCESS,
      ...payload,
    }
  })
}

/**
 * @name sharesAvailableOnTeeCluster
 * @summary           Check that all enclaves from a cluster have registered a the Capsule NFT or a Secret NFT's key shares
 * @param clusterId   The TEE Cluster id.
 * @param nftId       The Capsule NFT id or Secret NFT id to check key registration on enclaves.
 * @param kind        The kind of NFT linked to the key being checked: "secret" or "capsule"
 * @returns           A boolean status indicating if enclaves have stored the NFT shares.
 */
export const sharesAvailableOnTeeCluster = async (clusterId = 0, nftId: number, kind: "secret" | "capsule") => {
  if (kind !== "secret" && kind !== "capsule") {
    throw new Error(`${Errors.TEE_ERROR}: Kind must be either "secret" or "capsule"`)
  }
  const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
  let isShareAvailable = false
  let i = 0
  while (isShareAvailable !== true && i <= teeEnclaves.length - 1) {
    const { exists } = await getTeeEnclaveSharesAvailablility(teeEnclaves[i], nftId, kind)
    isShareAvailable = exists
    i += 1
  }

  return isShareAvailable
}

/**
 * @name teeKeySharesRetrieve
 * @summary           Get secret data shares from TEE enclaves.
 * @param clusterId   The TEE Cluster id to upload shares to.
 * @param kind        The kind of nft linked to the key being retrieved: "secret" or "capsule"
 * @param payload     The payload containing secret NFT data, the keyring address and the signature. You can use our formatPayload() function.
 * @returns           TEE enclave response.
 */
export const teeKeySharesRetrieve = async (
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
  const errors: string[] = []
  let shares = await Promise.all(
    teeEnclaves.map(async (baseUrl) => {
      const http = new HttpClient(ensureHttps(baseUrl))
      const endpoint = kind === "secret" ? TEE_RETRIEVE_SECRET_NFT_ENDPOINT : TEE_RETRIEVE_CAPSULE_NFT_ENDPOINT
      try {
        const res = await TeePost<RetrievePayloadType, TeeRetrieveDataResponseType>(http, endpoint, payload)
        if (res.status !== TEE_RETRIEVE_STATUS_SUCCESS)
          errors.push(res.description ? res.description.split(":")[1] : "Share could not be retrieved")
        return res.status === TEE_RETRIEVE_STATUS_SUCCESS && res.keyshare_data
          ? res.keyshare_data.split("_")[1]
          : undefined
      } catch {
        errors.push("Enclave not available")
      }
    }),
  )

  shares = shares.filter((x) => x !== undefined)
  if (shares.length < SSSA_THRESHOLD) {
    throw new Error(`${Errors.TEE_RETRIEVE_ERROR} - Shares could not be retrieved: ${errors[0]}`)
  }
  return shares as string[]
}

/**
 * @name teeKeySharesRemove
 * @summary                 Remove the share of a burnt NFT from the enclaves.
 * @param clusterId         The TEE Cluster id to remove the shares of the burnt NFT.
 * @param kind              The kind of NFT linked to the key being deleted: "secret" or "capsule"
 * @param requesterAddress  The requester address who want to remove the NFT key share.
 * @param nftId             The burnt NFT id to remove the key.
 * @returns                 An array of JSONs containing the TEE enclave result (status (boolean), enclave_id, nft_id, description)
 */
export const teeKeySharesRemove = async (
  clusterId: number,
  kind: "secret" | "capsule",
  requesterAddress: string,
  nftId: number,
): Promise<TeeGenericDataResponseType[]> => {
  if (kind !== "secret" && kind !== "capsule") {
    throw new Error(`${Errors.TEE_REMOVE_ERROR} : Kind must be either "secret" or "capsule"`)
  }
  const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
  const payload: TeeSharesRemoveType = {
    requester_address: requesterAddress,
    nft_id: nftId,
  }

  const shares = await Promise.all(
    teeEnclaves.map(async (baseUrl) => {
      const http = new HttpClient(ensureHttps(baseUrl))
      const endpoint =
        kind === "secret" ? TEE_REMOVE_SECRET_NFT_KEYSHARE_ENDPOINT : TEE_REMOVE_CAPSULE_NFT_KEYSHARE_ENDPOINT
      try {
        const res = await TeePost<TeeSharesRemoveType, TeeGenericDataResponseType>(http, endpoint, payload)
        return res
      } catch {
        return {
          status: Errors.TEE_REMOVE_ERROR,
          nft_id: nftId,
          enclave_id: baseUrl,
          description: "Enclave not available",
        }
      }
    }),
  )

  return shares
}
