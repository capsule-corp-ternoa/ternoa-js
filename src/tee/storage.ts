import { query } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"

import { ClusterDataType, EnclaveDataType } from "./types"

/**
 * @name getClusterData
 * @summary            Provides the data related to a cluster.
 * @param clusterId    The Cluster id.
 * @returns            An array containing the cluster data: the list of enclaves
 */
export const getClusterData = async (clusterId: number): Promise<ClusterDataType | null> => {
  const data = await query(txPallets.tee, chainQuery.clusterData, [clusterId])
  if (data.isEmpty == true) {
    throw new Error(`${Errors.TEE_CLUSTER_NOT_FOUND}: ${clusterId}`)
  }
  try {
    const result = data.toJSON() as ClusterDataType
    return result
  } catch (error) {
    throw new Error(`${Errors.CLUSTER_CONVERSION_ERROR}`)
  }
}

/**
 * @name getEnclaveData
 * @summary            Provides the data related to an enclave.
 * @param enclaveId    The Enclave id.
 * @returns            A JSON object with the enclave data. ex:{enclaveAddress, apiUri (...)}
 */
export const getEnclaveData = async (enclaveId: string): Promise<EnclaveDataType | null> => {
  const data = await query(txPallets.tee, chainQuery.enclaveData, [enclaveId])
  if (data.isEmpty == true) {
    throw new Error(`${Errors.TEE_ENCLAVE_NOT_FOUND}: ${enclaveId}`)
  }
  try {
    const result = data.toJSON() as EnclaveDataType
    return result
  } catch (error) {
    throw new Error(`${Errors.ENCLAVE_CONVERSION_ERROR}`)
  }
}

/**
 * @name getNextClusterIdAvailable
 * @summary            Provides the next available cluster id.
 * @returns            A number corresponding to the next available cluster id.
 */
export const getNextClusterIdAvailable = async () => {
  try {
    const data = await query(txPallets.tee, chainQuery.nextClusterId)
    if (data.isEmpty == true) {
      throw new Error(`${Errors.NEXT_TEE_CLUSTER_UNDEFINED}`)
    }
    return data.toHuman() as number
  } catch (error) {
    throw new Error(`${Errors.NEXT_TEE_CLUSTER_UNDEFINED}`)
  }
}
