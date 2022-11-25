export type generatePGPKeysType = {
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

export type NftMetadataType<T> = T & {
  title: string
  description: string
}

export type CollectionMetadataType<T> = T & {
  name: string
  description: string
}

export type MarketplaceMetadataType<T> = T & {
  name: string
}

export type SgxErrorResDataType = {
  status: number
  nft_id: number
  cluster_id: number
  secret_data?: string
  description: string
}
