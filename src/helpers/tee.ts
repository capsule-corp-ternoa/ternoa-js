// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { create, combine } from "sssa-js"
import { Buffer } from "buffer"
import { IKeyringPair } from "@polkadot/types/types"
import { hexToString } from "@polkadot/util"
import { createHash } from "crypto"

import { getLastBlock, getSignatureFromExtension, getSignatureFromKeyring } from "./crypto"
import { HttpClient } from "./http"
import {
  RetrievePayloadType,
  StorePayloadType,
  TeeGenericDataResponseType,
  TeeRetrieveDataResponseType,
  TeeSharesStoreType,
  TeeSharesRemoveType,
  RequesterType,
  ReconciliationPayloadType,
  TeeReconciliationType,
  NFTListType,
} from "./types"
import { ensureHttps, removeURLSlash, retryPost, timeoutTrigger } from "./utils"

import { getClusterData, getEnclaveData, getNextClusterIdAvailable } from "../tee"
import { Errors, chainQuery, txPallets } from "../constants"
import {
  EnclaveDataAndHealthType,
  EnclaveQuoteRawType,
  EnclaveQuoteType,
  EnclaveHealthType,
  NFTShareAvailableType,
  PopulatedEnclavesDataType,
  ClusterDataType,
} from "../tee/types"
import { isValidAddress, query } from "../blockchain"
import { getBalances } from "../balance"
import { BN } from "bn.js"

export const SSSA_NUMSHARES = 5
export const SSSA_THRESHOLD = 3
export const ENCLAVES_IN_CLUSTER = 5

const TEE_STORE_STATUS_SUCCESS = "STORESUCCESS"
const TEE_RETRIEVE_STATUS_SUCCESS = "RETRIEVESUCCESS"
export const TEE_HEALTH_ENDPOINT = "/api/health"
export const TEE_QUOTE_ENDPOINT = "/api/quote"
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
export const RECONCILIATION_NFT_INTERVAL = "/api/metric/interval-nft-list"

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
export const getEnclaveHealthStatus = async (clusterId = 0, timeout = 10000) => {
  const teeEnclaves = await getTeeEnclavesBaseUrl(clusterId)
  const lastBlock = await getLastBlock()
  const clusterHealthCheck = await Promise.all(
    teeEnclaves.map(async (enclaveUrl, idx) => {
      const http = new HttpClient(ensureHttps(enclaveUrl), timeout)
      const enclaveData: EnclaveHealthType = await http.getRaw(TEE_HEALTH_ENDPOINT)
      const isError = enclaveData.status !== 200
      if (isError || !enclaveData.sync_state.length || enclaveData.sync_state == "setup") throw new Error(
        `${Errors.TEE_ENCLAVE_NOT_AVAILBLE} - ID ${idx}, URL: ${enclaveUrl}. ${enclaveData.description}`,
      )
      // ADDITIONAL CHECKS
      if ((lastBlock - enclaveData.block_number) > 4) throw new Error(
        `${Errors.TEE_ENCLAVE_NOT_AVAILBLE} - ID ${idx}, URL: ${enclaveUrl}. Enclave blocks not synchornized with chain`,
      )
      const { free } = await getBalances(enclaveData.enclave_address)
      const ONE_CAPS = new BN("1000000000000000000")
      if (free.lt(ONE_CAPS)) throw new Error(
        `${Errors.TEE_ENCLAVE_NOT_AVAILBLE} - ID ${idx}, URL: ${enclaveUrl}. Enclave balance too low`,
      )
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
  if (clusterData.enclaves.length === 0) throw new Error(`${Errors.TEE_CLUSTER_IS_EMPTY}: ${clusterId}`)
  const data: PopulatedEnclavesDataType[] = await Promise.all(
    clusterData.enclaves.map(async (enclave) => {
      const enclaveData = await getEnclaveData(enclave[0])
      if (!enclaveData) throw new Error(Errors.TEE_ENCLAVE_NOT_FOUND)
      return {
        clusterId,
        clusterType: clusterData.clusterType,
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
export const getEnclaveDataAndHealth = async (clusterId = 0, timeout = 10000): Promise<EnclaveDataAndHealthType[]> => {
  const teeEnclaves = await populateEnclavesData(clusterId)
  const enclaveData: EnclaveDataAndHealthType[] = await Promise.all(
    teeEnclaves.map(async (e, idx) => {
      try {
        const http = new HttpClient(ensureHttps(e.enclaveUrl), timeout)
        const enclaveHealthData: EnclaveHealthType = await http.getRaw(TEE_HEALTH_ENDPOINT)
        const { block_number, sync_state, version, description, status } = enclaveHealthData
        return { ...e, status, blockNumber: block_number, syncState: sync_state, description, version }
      } catch (error) {
        const blockNumber = await getLastBlock()
        const description =
          error instanceof Error ? `SGX_SERVER_ERROR - ${error.message}` : "SGX_SERVER_ERROR - ENCLAVE UNREACHABLE"
        return { ...teeEnclaves[idx], status: 500, blockNumber, syncState: "Internal Error", description }
      }
    }),
  )
  return enclaveData
}

/**
 * @name getEnclavesQuote
 * @summary           Generate the enclaves quote.
 * @param clusterId   The TEE Cluster id.
 * @returns           An array of JSONs containing each enclave quote information (status, data or error)
 */
export const getEnclavesQuote = async (clusterId = 0): Promise<EnclaveQuoteType[]> => {
  const teeEnclaves = await populateEnclavesData(clusterId)
  const clusterQuote = await Promise.all(
    teeEnclaves.map(async (e, idx) => {
      try {
        const http = new HttpClient(ensureHttps(e.enclaveUrl))
        const enclaveData: EnclaveQuoteRawType = await http.getRaw(TEE_QUOTE_ENDPOINT)
        const { status, data, block_number } = enclaveData
        return { ...e, status, data, blockNumber: block_number }
      } catch (error) {
        const description =
          error instanceof Error
            ? `INTERNAL_SGX_SERVER_ERROR - ${error.message}`
            : `INTERNAL_SGX_SERVER_ERROR - QUOTE_NOT_AVAILABLE`
        return { ...teeEnclaves[idx], status: 500, data: description }
      }
    }),
  )
  return clusterQuote
}

/**
 * @name getPublicsClusters
 * @summary           Provides the list of the availables publics clusters.
 * @returns           An array of publics clusterId.
 */
export const getPublicsClusters = async () => {
  const nextClusterId = await getNextClusterIdAvailable()
  const clustersList: number[] = []
  for (let i = 0; i < nextClusterId; i++) {
    try {
      const data = await query(txPallets.tee, chainQuery.clusterData, [i])
      const result = data.toJSON() as ClusterDataType
      if (result) {
        const { enclaves, clusterType } = result
        // CHECK PUBLIC CLUSTERS WITH THE 5 ENCLAVES WORKING
        if (enclaves.length === ENCLAVES_IN_CLUSTER && clusterType === "Public") {
          clustersList.push(i)
        }
      }
    } catch (error) {
      // DO NOT THROW AN ERROR - WE WANT TO PROVIDE A LIST.
      // console.log(`CLUSTER_UNAVAILABLE: ${i} - ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }
  return clustersList
}

/**
 * @name getFirstPublicClusterAvailable
 * @summary           Provides the id of the first available healthy public cluster.
 * @returns           A clusterId as a number.
 */
export const getFirstPublicClusterAvailable = async (timeout = 10000) => {
  const publicClusters = await getPublicsClusters()
  if (publicClusters.length === 0) return undefined;

  for (const cluster of publicClusters) {
    try {
      const healthData = await timeoutTrigger<EnclaveHealthType[]>(() =>
        getEnclaveHealthStatus(cluster, timeout),
        timeout + 1000
      )
      if (healthData.length === ENCLAVES_IN_CLUSTER) {
        return cluster
      }
    } catch (error) {
      // DO NOT THROW AN ERROR - CONTINUE TO THE NEXT CLUSTER.
    }
  }
  return undefined
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
  if (clusterData.enclaves.length === 0) throw new Error(`${Errors.TEE_CLUSTER_IS_EMPTY}: ${clusterId}`)
  const urls: string[] = await Promise.all(
    clusterData.enclaves.map(async (enclave) => {
      const enclaveData = await getEnclaveData(enclave[0])
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
 * @name teePost
 * @summary               Upload secret payload data to an TEE enclave.
 * @param http            HttpClient instance.
 * @param endpoint        TEE enclave endpoint.
 * @param secretPayload   Payload formatted with the required secret NFT's data.
 * @returns               TEE enclave response.
 */
export const teePost = async <T, K>(http: HttpClient, endpoint: string, secretPayload: T): Promise<K> => {
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
  const teeEnclaves = await populateEnclavesData(clusterId)
  if (teeEnclaves.length !== SSSA_NUMSHARES)
    throw new Error(
      `${Errors.NOT_CORRECT_AMOUNT_TEE_ENCLAVES} - Got: ${teeEnclaves.length}; Expected: ${SSSA_NUMSHARES}`,
    )
  const teeRes = await Promise.all(
    payloads.map(async (payload, idx) => {
      const { enclaveUrl, enclaveAddress, operatorAddress, enclaveSlot } =
        teeEnclaves[enclavesIndex && enclavesIndex.length > 0 ? enclavesIndex[idx] : idx]
      const http = new HttpClient(ensureHttps(enclaveUrl))
      const endpoint = kind === "secret" ? TEE_STORE_SECRET_NFT_ENDPOINT : TEE_STORE_CAPSULE_NFT_ENDPOINT
      const post = async () => await teePost<StorePayloadType, TeeGenericDataResponseType>(http, endpoint, payload)
      const retryFn = await retryPost<TeeGenericDataResponseType>(post, nbRetry)
      return { enclaveAddress, operatorAddress, enclaveSlot, ...retryFn }
    }),
  )

  return teeRes.map((enclaveRes, i) => {
    const payload = payloads[i]
    if ("isRetryError" in enclaveRes) {
      const { message, status, enclaveAddress, operatorAddress, enclaveSlot } = enclaveRes
      return {
        enclaveAddress,
        operatorAddress,
        enclaveSlot,
        description: message,
        nft_id: Number(payload.data.split("_")[0]),
        status: status,
        isError: true,
        ...payload,
      }
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
        const res = await teePost<RetrievePayloadType, TeeRetrieveDataResponseType>(http, endpoint, payload)
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
        const res = await teePost<TeeSharesRemoveType, TeeGenericDataResponseType>(http, endpoint, payload)
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

/**
 * @name formatReconciliationIntervalPayload
 * @summary                       Prepares post request payload to reconciliate the list of secret/capsule NFT synced on a block interval period.
 * @param interval                The block number interval period: an array of the starting and ending block.
 * @param metricsServerKeyring    The metric server keyring.
 * @returns                       A formatted payload ready to be submitted to TEE enclaves.
 */
export const formatReconciliationIntervalPayload = async (
  interval: [number, number],
  metricsServerKeyring: IKeyringPair,
): Promise<ReconciliationPayloadType> => {
  const block_number = await getLastBlock()
  const block_validation = SIGNER_BLOCK_VALIDITY
  const formattedInterval = JSON.stringify(interval)
  const data_hash = createHash("sha256").update(formattedInterval).digest("hex")
  const authenticationToken = JSON.stringify({
    block_number,
    block_validation,
    data_hash,
  })
  const signedToken = getSignatureFromKeyring(metricsServerKeyring, authenticationToken)
  return {
    metric_account: metricsServerKeyring.address,
    block_interval: formattedInterval,
    auth_token: authenticationToken,
    signature: signedToken,
  }
}

/**
 * @name teeNFTReconciliation
 * @summary                       Get a reconciliation list of secret/capsule NFT synced on a block interval period.
 * @param clusterId               The TEE Cluster id to query.
 * @param interval                The block number interval period: an array of the starting and ending block.
 * @param metricsServerKeyring    The metric server keyring.
 * @returns                       An array of JSONs containing the NFT list and the TEE addresses (operator & enclave)
 */
export const teeNFTReconciliation = async (
  clusterId: number,
  interval: [number, number],
  metricsServerKeyring: IKeyringPair,
) => {
  const payload = await formatReconciliationIntervalPayload(interval, metricsServerKeyring)
  if (!payload) throw new Error(Errors.RECONCILIATION_PAYLOAD_UNDEFINED)
  const teeEnclaves = await populateEnclavesData(clusterId)
  if (teeEnclaves.length !== SSSA_NUMSHARES)
    throw new Error(
      `${Errors.NOT_CORRECT_AMOUNT_TEE_ENCLAVES} - Got: ${teeEnclaves.length}; Expected: ${SSSA_NUMSHARES}`,
    )
  const errors: TeeReconciliationType[] = []
  let nftList = await Promise.all(
    teeEnclaves.map(async (e) => {
      const http = new HttpClient(ensureHttps(e.enclaveUrl))
      try {
        const data = await teePost<ReconciliationPayloadType, NFTListType>(http, RECONCILIATION_NFT_INTERVAL, payload)
        return {
          enclaveAddress: e.enclaveAddress,
          operatorAddress: e.operatorAddress,
          nftId: data.nftid,
        } as TeeReconciliationType
      } catch (error) {
        const errorDescription = error instanceof Error ? error.message : JSON.stringify(error)
        errors.push({
          enclaveAddress: e.enclaveAddress,
          operatorAddress: e.operatorAddress,
          nftId: [],
          error: errorDescription,
        })
      }
    }),
  )

  if (!nftList) throw new Error(Errors.NFT_RECONCILIATION_FAILED)
  nftList = nftList.filter((x) => x !== undefined)
  return [...nftList, ...errors]
}