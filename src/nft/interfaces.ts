export type INftState = {
  isCapsule: boolean
  listedForSale: boolean
  isSecret: boolean
  isDelegated: boolean
  isSoulbound: boolean
}

export type INftData = {
  owner: string
  creator: string
  offchainData: string
  collectionId: number | undefined
  royalty: number
  state: INftState
}

export interface ICollectionData {
  owner: string
  offchainData: string
  nfts: number[]
  limit: number
  isClosed: boolean
}
