import BN from "bn.js"

export type EnclaveDataType = {
  enclaveAddress: string
  apiUri: string
}

export type EnclaveHealthType = {
  status: number
  date: string
  description: string
  enclave_address: string
}

export type PopulatedEnclavesDataType = {
  enclaveAddress: string
  operatorAddress: string
  enclaveUrl: string
  enclaveSlot: number
  clusterId: number
  clusterType: string
}

export type EnclaveDataAndHealthType = PopulatedEnclavesDataType & Omit<EnclaveHealthType, "enclave_address">

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
  operatorAddress: string
  param1: number
  param2: number
  param3: number
  param4: number
  param5: number
}

export type EnclaveQuoteRawType = {
  status: string
  data?: string
  error?: string
}

export type EnclaveQuoteType = EnclaveQuoteRawType & PopulatedEnclavesDataType
