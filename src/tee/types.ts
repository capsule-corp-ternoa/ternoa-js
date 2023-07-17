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

// export type EnclaveQuoteRawType = {
//   status: string
//   data?: Date
//   error?: string
// }

// export type EnclaveQuoteType = EnclaveQuoteRawType & {
//   enclaveUrl?: string
// }

export type ClusterDataType = {
  enclaves: [string, number][]
  isPublic?: boolean
}

export type NFTShareAvailableType = {
  enclave_id: string
  nft_id: number
  exists: boolean
}
