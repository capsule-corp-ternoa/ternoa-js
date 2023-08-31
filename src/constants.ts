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
  transmissionProtocols = "transmissionProtocols",
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
  setCollectionOffchaindata = "setCollectionOffchaindata",
  setNftMintFee = "setNftMintFee",

  // capsule
  convertToCapsule = "convertToCapsule",
  createCapsule = "createCapsule",
  revertCapsule = "revertCapsule",
  setCapsuleOffchaindata = "setCapsuleOffchaindata",
  notifyEnclaveKeyUpdate = "notifyEnclaveKeyUpdate",

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

  // transmission protocols
  addConsent = "addConsent",
  removeTransmissionProtocol = "removeTransmissionProtocol",
  resetTimer = "resetTimer",
  setTransmissionProtocol = "setTransmissionProtocol",

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

  // tee
  submitMetricsServerReport = "submitMetricsServerReport",
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

  // capsule
  capsuleMintFee = "capsuleMintFee",
  capsuleOffchainData = "capsuleOffchainData",

  // transmissionProtocols
  atBlockFee = "atBlockFee",
  atBlockWithResetFee = "atBlockWithResetFee",
  onConsentFee = "onConsentFee",
  onConsentAtBlockFee = "onConsentAtBlockFee",
  atBlockQueue = "atBlockQueue",
  transmissions = "transmissions",
  onConsentData = "onConsentData",

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

  // transmissionProtocols
  simultaneousTransmissionLimit = "simultaneousTransmissionLimit",
  maxConsentListSize = "maxConsentListSize",
  maxBlockDuration = "maxBlockDuration",
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
  VALUE_MUST_BE_DEFINED = "VALUE_MUST_BE_DEFINED",
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
  MUST_BE_A_NUMBER = "MUST_BE_A_NUMBER",
  URL_UNDEFINED = "URL_UNDEFINED",
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
  TRANSMISSION_PROTOCOL_CONVERSION_ERROR = "TRANSMISSION_PROTOCOL_CONVERSION_ERROR",
  TEE_CLUSTER_NOT_FOUND = "TEE_CLUSTER_NOT_FOUND",
  TEE_CLUSTER_IS_EMPTY = "TEE_CLUSTER_IS_EMPTY",
  TEE_ENCLAVE_NOT_FOUND = "TEE_ENCLAVE_NOT_FOUND",
  TEE_ENCLAVE_NOT_AVAILBLE = "TEE_ENCLAVE_NOT_AVAILBLE",
  TEE_UPLOAD_ERROR = "TEE_UPLOAD_ERROR",
  TEE_RETRIEVE_ERROR = "TEE_RETRIEVE_ERROR",
  TEE_REMOVE_ERROR = "TEE_REMOVE_ERROR",
  TEE_ERROR = "TEE_ERROR",
  NOT_CORRECT_AMOUNT_TEE_PAYLOADS = "NOT_CORRECT_AMOUNT_TEE_PAYLOADS",
  NOT_CORRECT_AMOUNT_TEE_ENCLAVES = "NOT_CORRECT_AMOUNT_TEE_ENCLAVES",
}
