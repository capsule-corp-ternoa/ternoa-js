export type EnclaveDataType = {
  enclaveAddress: string
  apiUri: string
}

export type EnclaveHealthType = {
  status: number
  date: Date
  description: string
  enclave_address: string
  operator_address: string
  binary_hash: { [k: string]: string }
  quote: Uint32Array
}

export type ClusterDataType = { enclaves: string[] }
