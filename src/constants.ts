export enum txPallets {
  assets = "assets",
  auction = "auction",
  marketplace = "marketplace",
  nft = "nft",
  rent = "rent",
  utility = "utility",
  balances = "balances",
  associatedAccounts = "associatedAccounts",
  system = "system",
  tee = "tee",
}

export enum txActions {
  create = "create",
  transfer = "transfer",
  transferAll = "transferAll",
  transferKeepAlive = "transferKeepAlive",
  batch = "batch",
  batchAll = "batchAll",
  forceBatch = "forceBatch",

  // nft
  addSecret = "addSecret",
  createNft = "createNft",
  createSecretNft = "createSecretNft",
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

  // rent
  createContract = "createContract",
  cancelContract = "cancelContract",
  acceptRentOffer = "acceptRentOffer",
  acceptSubscriptionTerms = "acceptSubscriptionTerms",
  changeSubscriptionTerms = "changeSubscriptionTerms",
  rent = "rent",
  makeRentOffer = "makeRentOffer",
  retractRentOffer = "retractRentOffer",
  revokeContract = "revokeContract",

  // marketplace
  buyNft = "buyNft",
  createMarketplace = "createMarketplace",
  listNft = "listNft",
  unlistNft = "unlistNft",
  setMarketplaceConfiguration = "setMarketplaceConfiguration",
  setMarketplaceKind = "setMarketplaceKind",
  setMarketplaceOwner = "setMarketplaceOwner",
  setMarketplaceMintFee = "setMarketplaceMintFee",

  // auction
  createAuction = "createAuction",
  cancelAuction = "cancelAuction",
  endAuction = "endAuction",
  addBid = "addBid",
  removeBid = "removeBid",
  buyItNow = "buyItNow",
  claim = "claim",
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
  secretNftMintFee = "secretNftMintFee",
  secretNftsOffchainData = "secretNftsOffchainData",
  nfts = "nfts",
  nextNFTId = "nextNFTId",
  nextCollectionId = "nextCollectionId",
  marketplaceMintFee = "marketplaceMintFee",
  account = "account",
  number = "number",
  collections = "collections",
  nextMarketplaceId = "nextMarketplaceId",
  marketplaces = "marketplaces",
  listedNfts = "listedNfts",

  // auction
  auctions = "auctions",
  deadlines = "deadlines",
  claims = "claims",

  // rent
  contracts = "contracts",
  queues = "queues",
  offers = "offers",

  // tee
  clusterData = "clusterData",
  enclaveData = "enclaveData",
}

export enum chainConstants {
  initialMintFee = "initialMintFee",
  initialSecretMintFee = "initialSecretMintFee",
  collectionSizeLimit = "collectionSizeLimit",
  existentialDeposit = "existentialDeposit",
  nftOffchainDataLimit = "nftOffchainDataLimit",
  collectionOffchainDataLimit = "collectionOffchainDataLimit",
  offchainDataLimit = "offchainDataLimit",
  accountSizeLimit = "accountSizeLimit",

  // auction
  auctionEndingPeriod = "auctionEndingPeriod",
  auctionGracePeriod = "auctionGracePeriod",
  bidderListLengthLimit = "bidderListLengthLimit",
  maxAuctionDelay = "maxAuctionDelay",
  minAuctionDuration = "minAuctionDuration",
  maxAuctionDuration = "maxAuctionDuration",
  parallelAuctionLimit = "parallelAuctionLimit",

  // rent
  actionsInBlockLimit = "actionsInBlockLimit",
  maximumContractAvailabilityLimit = "maximumContractAvailabilityLimit",
  maximumContractDurationLimit = "maximumContractDurationLimit",
  simultaneousContractLimit = "simultaneousContractLimit",
}

export enum WaitUntil {
  BlockInclusion,
  BlockFinalization,
}

export enum Errors {
  EXTRINSIC_FAILED = "EXTRINSIC_FAILED",
  EVENT_NOT_FOUND = "EVENT_NOT_FOUND",
  SEED_NOT_FOUND = "SEED_NOT_FOUND",
  PUBLIC_SEED_ADDRESS_NOT_FOUND = "PUBLIC_SEED_ADDRESS_NOT_FOUND",
  VALUE_MUST_BE_GREATER_THAN_0 = "VALUE_MUST_BE_GREATER_THAN_0",
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
  MUST_BE_PERCENTAGE = "MUST_BE_PERCENTAGE",
  NFT_CONVERSION_ERROR = "NFT_CONVERSION_ERROR",
  COLLECTION_CONVERSION_ERROR = "COLLECTION_CONVERSION_ERROR",
  MARKETPLACE_CONVERSION_ERROR = "MARKETPLACE_CONVERSION_ERROR",
  LISTED_NFT_CONVERSION_ERROR = "LISTED_NFT_CONVERSION_ERROR",
  IPFS_FILE_UPLOAD_ERROR = "IPFS_FILE_UPLOAD_ERROR",
  IPFS_METADATA_VALIDATION_ERROR = "IPFS_METADATA_VALIDATION_ERROR",
  BLOCK_NOT_FOUND_ON_CHAIN = "BLOCK_NOT_FOUND_ON_CHAIN",
  AUCTION_NFT_CONVERSION_ERROR = "AUCTION_NFT_CONVERSION_ERROR",
  RENT_NFT_CONVERSION_ERROR = "RENT_NFT_CONVERSION_ERROR",
  CLUSTER_CONVERSION_ERROR = "CLUSTER_CONVERSION_ERROR",
  ENCLAVE_CONVERSION_ERROR = "ENCLAVE_CONVERSION_ERROR",
  SGX_CLUSTER_NOT_FOUND = "SGX_CLUSTER_NOT_FOUND",
  SGX_ENCLAVE_NOT_FOUND = "SGX_ENCLAVE_NOT_FOUND",
  SGX_ENCLAVE_NOT_AVAILBLE = "SGX_ENCLAVE_NOT_AVAILBLE",
  NOT_CORRECT_AMOUNT_SGX_PAYLOADS = "NOT_CORRECT_AMOUNT_SGX_PAYLOADS",
  NOT_CORRECT_AMOUNT_SGX_ENCLAVES = "NOT_CORRECT_AMOUNT_SGX_ENCLAVES",
}
