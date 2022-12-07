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
  const data = await query(txPallets.tee, chainQuery.clusterRegistry, [clusterId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toJSON() as any
    return result
  } catch (error) {
    throw new Error(`${Errors.CLUSTER_CONVERSION_ERROR}`)
  }
}

/**
 * @name getEnclaveData
 * @summary            Provides the data related to an enclave.
 * @param enclaveId    The Enclave id.
 * @returns            A JSON object with the enclave data. ex:{api_url, (...)}
 */
export const getEnclaveData = async (enclaveId: number): Promise<EnclaveDataType | null> => {
  const data = await query(txPallets.tee, chainQuery.enclaveRegistry, [enclaveId])
  if (data.isEmpty == true) {
    return null
  }

  try {
    const result = data.toJSON() as any
    return result
  } catch (error) {
    throw new Error(`${Errors.ENCLAVE_CONVERSION_ERROR}`)
  }
}
