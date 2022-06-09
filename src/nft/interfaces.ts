interface IState {
  isCapsule: boolean
  listedForSale: boolean
  isSecret: boolean
  isDelegated: boolean
  isSoulbound: boolean
}

export interface INftDatas {
  owner: string
  creator: string
  offchainData: string
  collectionId: number | null
  royalty: number
  state: IState
}

export interface ICollectionDatas {
  owner: string
  offchainData: string
  nfts: number[]
  limit: number
  isClosed: boolean
}
