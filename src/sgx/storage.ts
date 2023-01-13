import { query } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"

import { ClusterDataType, EnclaveDataType } from "./types"

/**
 * @name getClusterData
 * @summary            Provides the data related to a cluster.
 * @param clusterId    The Cluster id.
 * @returns            A JSON object with the cluster data. ex:{enclaves, (...)}
 */
export const getClusterData = async (clusterId: number): Promise<ClusterDataType | null> => {
  const data = await query(txPallets.tee, chainQuery.clusterData, [clusterId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toJSON() as any
    if(result && result['enclaves']&& result['enclaves'].length)
    return result['enclaves']
    else
    throw new Error(`No enclaves in clustor ${clusterId}`)
  } catch (error) {
    throw new Error(`${Errors.CLUSTER_CONVERSION_ERROR}`)
  }
}

/**
 * @name getEnclaveData
 * @summary            Provides the data related to an enclave.
 * @param enclaveAddressId    The Enclave id.
 * @returns            A JSON object with the enclave data. ex:{api_url, (...)}
 */
export const getEnclaveData = async (enclaveAddressId: string): Promise<EnclaveDataType | null> => {
  const data = await query(txPallets.tee, chainQuery.enclaveData, [enclaveAddressId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toHuman() as any
    return result.apiUri
  } catch (error) {
    throw new Error(`${Errors.ENCLAVE_CONVERSION_ERROR}`)
  }
}
