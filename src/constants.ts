import { Event } from "@polkadot/types/interfaces/system";

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
  addNftToCollection = "addNftToCollection",
  createCollection = "createCollection",
  limitCollection = "limitCollection",
  closeCollection = "closeCollection",
  burnCollection = "burnCollection",
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
  BlockFinalization,
}

export enum EventType {
  CreateCollection,
  CreateNFT
}


export class BlockchainEvent {
  type: EventType
  constructor(type: EventType) {
    this.type = type;
  }

  static fromEvent(event: Event): BlockchainEvent | null {
    if (event.method == "CollectionCreated") {
      return new CreateCollectionEvent(event);
    } else if (event.method == "NFTCreated") {
      return new CreateNFTEvent(event);
    }

    return null;
  }
}

export class CreateCollectionEvent extends BlockchainEvent {
  collectionId: number;
  owner: string;
  metadata: string;
  limit: number;

  constructor(event: Event) {
    super(EventType.CreateCollection);

    this.collectionId = Number.parseInt(event.data[0].toString());
    this.owner = event.data[1].toString();
    this.limit = Number.parseInt(event.data[3].toString());

    let metadata = event.data[2].toHuman();
    this.metadata = metadata ? metadata.toString() : "";
  }
}

export class CreateNFTEvent extends BlockchainEvent {
  nftId: string;
  owner: string;
  metadata: string;
  royalty: string;
  collectionId: string | null;
  isSoulbound: string;

  constructor(event: Event) {
    super(EventType.CreateNFT);

    this.nftId = event.data[0].toString();
    this.owner = event.data[1].toString();
    this.royalty = event.data[3].toString();
    this.collectionId = event.data[4].toString();
    this.isSoulbound = event.data[5].toString();

    let metadata = event.data[2].toHuman();
    this.metadata = metadata ? metadata.toString() : "";
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class ConVar {
  done: boolean;
  maxWaitTime?: number // In Milliseconds
  sleepInterval: number // In Milliseconds

  constructor(sleepInterval: number = 1000, maxWaitTime?: number) {
    this.done = false;
    this.maxWaitTime = maxWaitTime;
    this.sleepInterval = sleepInterval;
  }

  notify() {
    this.done = true;
  }

  async wait(): Promise<boolean> {
    let sum = 0;
    while (this.done === false) {
      if (this.maxWaitTime && sum >= this.maxWaitTime) {
        return false;
      }

      await sleep(this.sleepInterval);
      sum += this.sleepInterval;
    }

    return true;
  }

  isDone() {
    return this.done;
  }

  clear() {
    this.done = false;
  }
}