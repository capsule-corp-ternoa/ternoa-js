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
  burnNft = "burnNft",
  transferNft = "transferNft",
  delegateNft = "delegateNft",
  setRoyalty = "setRoyalty",
  setNftMintFee = "setNftMintFee",
  create = "create",
  createNft = "createNft",
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
  nfTs = "nfTs",
  capsuleMintFee = "capsuleMintFee",
  marketplaceMintFee = "marketplaceMintFee",
  account = "account",
  number = "number",
}

export enum chainConstants {
  existentialDeposit = "existentialDeposit",
}
