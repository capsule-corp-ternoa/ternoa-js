export type EnclaveDataType = {
  enclaveAddress: string
  apiUri: string
}

export type EnclaveHealthType = {
  status: number
  description: string
  enclave_address: string
  block_number: number
  sync_state: string
  version: string
}

export type PopulatedEnclavesDataType = {
  clusterId: number
  clusterType: "Disabled" | "Admin" | "Public" | "Private"
  enclaveAddress: string
  operatorAddress: string
  enclaveUrl: string
  enclaveSlot: number
}

export type EnclaveDataAndHealthType = PopulatedEnclavesDataType & {
  status: number
  blockNumber: number
  syncState: string
  description: string
  version?: string
}

export type ClusterDataType = {
  enclaves: [string, number][]
  clusterType: "Disabled" | "Admin" | "Public" | "Private"
}

export type NFTShareAvailableType = {
  enclave_id: string
  nft_id: number
  exists: boolean
}

export type ReportParamsType = {
  param1: number
  param2: number
  param3: number
  param4: number
  param5: number
  submittedBy: string
}

export type EnclaveQuoteRawType = {
  status: number
  data: string
  block_number?: number
}

export type EnclaveQuoteType = EnclaveQuoteRawType & PopulatedEnclavesDataType
