import BN from "bn.js"

export enum txPallets {
  marketplace = "marketplace",
  nft = "nft",
  utility = "utility",
  balances = "balances",
  associatedAccounts = "associatedAccounts",
  system = "system",
}

export enum txActions {
  buy = "buy",
  list = "list",
  unlist = "unlist",
  burn = "burn",

  //TO DO : CLEAN list below
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
  setMarketplaceMintFee = "setMarketplaceMintFee",
}

export enum txEvent {
  ExtrinsicSuccess = "ExtrinsicSuccess",
  ExtrinsicFailed = "ExtrinsicFailed",
  BatchCompleted = "BatchCompleted",
  BatchInterrupted = "BatchInterrupted",
  nftsCreated = "Created",
  nftsBurned = "Burned",
  nftsTransfered = "Transfered",
  MarketplaceCreated = "MarketplaceCreated",
}

export enum chainQuery {
  nftMintFee = "nftMintFee",
  nfts = "nfts",
  nextNFTId = "nextNFTId",
  nextCollectionId = "nextCollectionId",
  marketplaceMintFee = "marketplaceMintFee",
  account = "account",
  number = "number",
  collections = "collections",
}

export enum chainConstants {
  initialMintFee = "initialMintFee",
  collectionSizeLimit = "collectionSizeLimit",
  existentialDeposit = "existentialDeposit",
  nftOffchainDataLimit = "nftOffchainDataLimit",
  collectionOffchainDataLimit = "collectionOffchainDataLimit",
}

export enum WaitUntil {
  BlockInclusion,
  BlockFinalization,
}

export enum MarketplaceKind {
  Public = "Public",
  Private = "Private",
}

export enum Errors {
  EXTRINSIC_FAILED = "EXTRINSIC_FAILED",
  EVENT_NOT_FOUND = "EVENT_NOT_FOUND",
  SEED_NOT_FOUND = "SEED_NOT_FOUND",
  PUBLIC_SEED_ADDRESS_NOT_FOUND = "PUBLIC_SEED_ADDRESS_NOT_FOUND",
  VALUE_LOWER_THAN_0 = "VALUE_LOWER_THAN_0",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  API_NOT_INITIALIZED = "API_NOT_INITIALIZED",
  API_NOT_CONNECTED = "API_NOT_CONNECTED",
  TRANSACTION_NOT_IN_BLOCK = "TRANSACTION_NOT_IN_BLOCK",
  EXTRINSIC_NOT_FOUND = "EXTRINSIC_NOT_FOUND",
  OFFCHAIN_LENGTH_TOO_HIGH = "OFFCHAIN_LENGTH_TOO_HIGH",
  LIMIT_TOO_LOW = "LIMIT_TOO_LOW",
  LIMIT_TOO_HIGH = "LIMIT_TOO_HIGH",
  NFT_NOT_FOUND = "NFT_NOT_FOUND",
  COLLECTION_NOT_FOUND = "COLLECTION_NOT_FOUND",
  ROYALTY_MUST_BE_PERCENTAGE = "ROYALTY_MUST_BE_PERCENTAGE",
  NFT_CONVERSION_ERROR = "NFT_CONVERSION_ERROR",
  COLLECTION_CONVERSION_ERROR = "COLLECTION_CONVERSION_ERROR",
}

export type TransactionHash = `0x${string}`
export type Balance = BN
