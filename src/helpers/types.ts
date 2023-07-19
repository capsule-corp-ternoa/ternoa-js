export type PGPKeysType = {
  privateKey: string
  publicKey: string
}

export interface IServiceIPFS {
  apiKey?: string
  apiUrl: URL
}

export type IpfsAddDataResponseType = {
  Bytes?: number
  Hash: string
  Name: string
  Size: string
}

export type NftMetadataType = {
  title: string
  description: string
  [key: string]: unknown
  properties?: {
    [key: string]: unknown
    media?: {
      [key: string]: unknown
    }
  }
}

export type MediaMetadataType = {
  name?: string
  description?: string
  [key: string]: unknown
}

export type CollectionMetadataType = Required<MediaMetadataType>

export type MarketplaceMetadataType = Omit<Required<MediaMetadataType>, "description">

export type RequesterType = "OWNER" | "DELEGATEE" | "RENTEE"

export type CapsuleMedia = {
  encryptedFile: string
  type: string
  [key: string]: unknown
}

export type CapsuleEncryptedMedia = {
  hash: string
  type: string
  size: number
}

export type StorePayloadType = {
  owner_address: string
  signer_address: string
  data: string
  signature: string
  signersig: string
}

export type RetrievePayloadType = {
  requester_address: string
  requester_type: RequesterType
  data: string
  signature: string
}

export type TeeGenericDataResponseType = {
  status: string
  nft_id: number
  enclave_id: string
  description: string
}

export type TeeRetrieveDataResponseType = {
  status: string
  nft_id?: number
  keyshare_data: string
  enclave_id: string
  description: string
}

export type TeeSharesStoreType = {
  isError: boolean
  enclave_id?: string
  enclaveAddress: string,
  operatorAddress: string,
  enclaveSlot:number,
} & Omit<TeeGenericDataResponseType, "enclave_id"> &
  StorePayloadType

export type RetryUploadErrorType = {
  isRetryError: boolean
  status: string
  message: string
}

export type TeeSharesRemoveType = {
  requester_address: string
  nft_id: number
}
