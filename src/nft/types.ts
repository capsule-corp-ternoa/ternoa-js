export type NftState = {
  isCapsule: boolean
  listedForSale: boolean
  isSecret: boolean
  isDelegated: boolean
  isSoulbound: boolean
  isRented: boolean
}

export type NftData = {
  owner: string
  creator: string
  offchainData: string
  collectionId: number | undefined
  royalty: number
  state: NftState
}

export type CollectionData = {
  owner: string
  offchainData: string
  nfts: number[]
  limit: number
  isClosed: boolean
}

export interface INFTMetadata {
  title: string
  description: string
  file: File
}

export interface ICollectionMetadata {
  name: string
  description: string
  profileFile: File
  bannerFile: File
}
