export enum txPallets {
  marketplace = "marketplace",
  nft = "nft",
  utility = "utility",
  balances = "balances",
  capsules = "capsules",
  associatedAccounts = "associatedAccounts",
  system = "system",
}

export enum txActions {
  buy = "buy",
  list = "list",
  unlist = "unlist",
  burn = "burn",

  create = "create",
  transfer = "transfer",
  transferAll = "transferAll",
  transferKeepAlive = "transferKeepAlive",
  finishSeries = "finishSeries",
  batch = "batch",
  batchAll = "batchAll",
  createFromNft = "createFromNft",
  remove = "remove",
  setIpfsReference = "setIpfsReference",
  setAltvrUsername = "setAltvrUsername",
  setCommissionFee = "setCommissionFee",
  setOwner = "setOwner",
  setKind = "setMarketType",
  setName = "setName",
  setUri = "setUri",
  setLogoUri = "setLogoUri",

  // nft
  createNft = "createNft",
  burnNft = "burnNft",
  transferNft = "transferNft",
  delegateNft = "delegateNft",
  setRoyalty = "setRoyalty",
  addNftToCollection = "addNftToCollection",
  createCollection = "createCollection",
  limitCollection = "limitCollection",
  closeCollection = "closeCollection",
  burnCollection = "burnCollection",
  setNftMintFee = "setNftMintFee",


  // marketplace
  buyNft = "buyNft",
  createMarketplace = "createMarketplace",
  listNft = "listNft",
  unlistNft = "unlistNft",
  setMarketplaceConfiguration = "setMarketplaceConfiguration",
  setMarketplaceKind = "setMarketplaceKind",
  setMarketplaceOwner = "setMarketplaceOwner",
  setMarketplaceMintFee = "setMarketplaceMintFee"
}

export enum txEvent {
  nftsCreated = "Created",
  nftsBurned = "Burned",
  nftsTransfered = "Transfered",
  CapsuleIpfsReferenceChanged = "CapsuleIpfsReferenceChanged",
  CapsuleCreated = "CapsuleCreated",
  CapsuleRemoved = "CapsuleRemoved",
  MarketplaceCreated = "MarketplaceCreated",
  ExtrinsicSuccess = "ExtrinsicSuccess",
  ExtrinsicFailed = "ExtrinsicFailed",
  BatchCompleted = "BatchCompleted",
  BatchInterrupted = "BatchInterrupted",
}

export enum chainQuery {
  nftMintFee = "nftMintFee",
  nfts = "nfts",
  nextNFTId = "nextNFTId",
  nextCollectionId = "nextCollectionId",
  collectionSizeLimit = "collectionSizeLimit",
  capsuleMintFee = "capsuleMintFee",
  marketplaceMintFee = "marketplaceMintFee",
  account = "account",
  number = "number",
  collections = "collections",
}

export enum chainConstants {
  existentialDeposit = "existentialDeposit",
  nftOffchainDataLimit = "nftOffchainDataLimit",
  collectionOffchainDataLimit = "collectionOffchainDataLimit",
}

export enum WaitUntil {
  BlockInclusion,
  BlockFinalization
}

export enum MarketplaceKind {
  Public = "Public",
  Private = "Private"
}