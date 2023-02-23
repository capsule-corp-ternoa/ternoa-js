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

export type NftMetadataType<T> = {
  title: string
  description: string
} & T

export type MediaMetadataType<T> = {
  name?: string
  description?: string
} & T

export type CollectionMetadataType<T> = Required<MediaMetadataType<T>>

export type MarketplaceMetadataType<T> = Omit<Required<MediaMetadataType<T>>, "description">

export type CapsuleMedia<T> = {
  encryptedFile: string
  type: string
} & T

export type CapsuleEncryptedMedia<T> = {
  hash: string
  type: string
  size: number
} & T

export type StorePayloadType = {
  owner_address: string
  signer_address: string
  secret_data: string
  signature: string
  signersig: string
}

export type RetrievePayloadType = {
  owner_address: string
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
  secret_data: string
  enclave_id: string
  description: string
}

export type TeeSharesStoreType = {
  isError: boolean
  enclave_id?: string
} & Omit<TeeGenericDataResponseType, "enclave_id"> &
  StorePayloadType

export type RetryUploadErrorType = {
  isRetryError: boolean
  status: string
  message: string
}

export type TeeSharesRemoveType = {
  owner_address: string
  nft_id: number
}
