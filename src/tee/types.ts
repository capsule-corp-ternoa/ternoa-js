export type EnclaveDataType = {
  enclaveAddress: string
  apiUri: string
}

export type EnclaveHealthType = {
  status:number
  description: string
  enclave_address: string
  block_number: number
  sync_state: string
  version: string
}

export type PopulatedEnclavesDataType = {
  enclaveAddress: string
  operatorAddress: string
  enclaveUrl: string
  enclaveSlot: number
  clusterId: number
  clusterType: string
}

export type EnclaveDataAndHealthType = PopulatedEnclavesDataType & {
  syncState: string
  description: string
  blockNumber: number
  version?: string
}

export type ClusterDataType = {
  enclaves: [string, number][]
  isPublic?: boolean
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
  status: string
  data?: string
  error?: string
}

export type EnclaveQuoteType = EnclaveQuoteRawType & PopulatedEnclavesDataType
