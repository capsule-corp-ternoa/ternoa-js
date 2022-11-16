export type NftState = {
  isCapsule: boolean
  isListed: boolean
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

export type SecretNftData = {
  nftId: number
  owner: string
  creator: string
  offchainData: string
  secretOffchainData: string
  collectionId: number | null
  royalty: number
  isSoulbound: boolean
}

export type CollectionData = {
  owner: string
  offchainData: string
  nfts: number[]
  limit: number
  isClosed: boolean
}
