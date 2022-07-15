import { Event } from "@polkadot/types/interfaces/system"
import { Errors } from "./constants"

export enum EventType {
  // Balances
  BalancesWithdraw = "balances.Withdraw",
  BalancesDeposit = "balances.Deposit",
  BalancesTransfer = "balances.Transfer",
  BalancesEndowed = "balances.Endowed",

  // Treasury
  TreasuryDeposit = "treasury.Deposit",

  // NFT
  NFTCreated = "nft.NFTCreated",
  NFTBurned = "nft.NFTBurned",
  NFTDelegated = "nft.NFTDelegated",
  NFTRoyaltySet = "nft.NFTRoyaltySet",
  NFTTransferred = "nft.NFTTransferred",
  NFTAddedToCollection = "nft.NFTAddedToCollection",

  // NFT Collections
  CollectionCreated = "nft.CollectionCreated",
  CollectionLimited = "nft.CollectionLimited",
  CollectionClosed = "nft.CollectionClosed",
  CollectionBurned = "nft.CollectionBurned",

  // Utility
  ItemCompleted = "utility.ItemCompleted",
  BatchInterrupted = "utility.BatchInterrupted",
  BatchCompleted = "utility.BatchCompleted",

  // System
  ExtrinsicFailed = "system.ExtrinsicFailed",
  ExtrinsicSuccess = "system.ExtrinsicSuccess",
  NewAccount = "system.NewAccount",

  // Unknown
  Unknown = "Unknown",
}

export class BlockchainEvent {
  type: EventType
  raw: Event
  section: string
  method: string

  constructor(raw: Event, type: EventType) {
    this.raw = raw
    this.type = type
    this.section = raw.section
    this.method = raw.method
  }

  static fromEvent(event: Event): BlockchainEvent {
    const name = event.section + "." + event.method
    switch (name) {
      // Balances
      case EventType.BalancesWithdraw:
        return new BalancesWithdrawEvent(event)
      case EventType.BalancesDeposit:
        return new BalancesDepositEvent(event)
      case EventType.BalancesTransfer:
        return new BalancesTransferEvent(event)
      case EventType.BalancesEndowed:
        return new BalancesEndowedEvent(event)
      // Treasury
      case EventType.TreasuryDeposit:
        return new TreasuryDepositEvent(event)
      // NFT
      case EventType.NFTCreated:
        return new NFTCreatedEvent(event)
      case EventType.NFTBurned:
        return new NFTBurnedEvent(event)
      case EventType.NFTDelegated:
        return new NFTDelegatedEvent(event)
      case EventType.NFTRoyaltySet:
        return new NFTRoyaltySetEvent(event)
      case EventType.NFTTransferred:
        return new NFTTransferredEvent(event)
      case EventType.NFTAddedToCollection:
        return new NFTAddedToCollectionEvent(event)
      case EventType.CollectionCreated:
        return new CollectionCreatedEvent(event)
      case EventType.CollectionLimited:
        return new CollectionLimitedEvent(event)
      case EventType.CollectionClosed:
        return new CollectionClosedEvent(event)
      case EventType.CollectionBurned:
        return new CollectionBurnedEvent(event)
      // Utility
      case EventType.ItemCompleted:
        return new ItemCompletedEvent(event)
      case EventType.BatchInterrupted:
        return new BatchInterruptedEvent(event)
      case EventType.BatchCompleted:
        return new BatchCompletedEvent(event)
      // System
      case EventType.ExtrinsicFailed:
        return new ExtrinsicFailedEvent(event)
      case EventType.ExtrinsicSuccess:
        return new ExtrinsicSuccessEvent(event)
      case EventType.NewAccount:
        return new NewAccountEvent(event)
    }

    return new UnknownEvent(event)
  }
}

/**
 * This class represents the on-chain BalancesWithdrawEvent event.
 */
export class BalancesWithdrawEvent extends BlockchainEvent {
  who: string //AccountId32
  amount: string // u128

  /**
   * Construct the data object from the BalancesWithdrawEvent event
   * @param event The BalancesWithdrawEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesWithdraw)

    this.who = event.data[0].toString()
    this.amount = event.data[1].toString()
  }
}

/**
 * This class represents the on-chain BalancesDepositEvent event.
 */
export class BalancesDepositEvent extends BlockchainEvent {
  who: string // AccountId32
  amount: string // u128

  /**
   * Construct the data object from the BalancesDepositEvent event
   * @param event The BalancesDepositEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesDeposit)

    this.who = event.data[0].toString()
    this.amount = event.data[1].toString()
  }
}

/**
 * This class represents the on-chain BalancesTransferEvent event.
 */
export class BalancesTransferEvent extends BlockchainEvent {
  from: string // AccountId32
  to: string // AccountId32
  amount: string // u128

  /**
   * Construct the data object from the BalancesTransferEvent event
   * @param event The BalancesTransferEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesTransfer)

    this.from = event.data[0].toString()
    this.to = event.data[1].toString()
    this.amount = event.data[2].toString()
  }
}

/**
 *  This class represents the on-chain BalancesEndowedEvent event.
 */
export class BalancesEndowedEvent extends BlockchainEvent {
  account: string // AccountId32
  freeBalance: string // u128

  /**
   * Construct the data object from the BalancesEndowedEvent event
   * @param event The BalancesEndowedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesEndowed)

    this.account = event.data[0].toString()
    this.freeBalance = event.data[1].toString()
  }
}

/**
 * This class represents the on-chain TreasuryDepositEvent event.
 */
export class TreasuryDepositEvent extends BlockchainEvent {
  value: string // u128

  /**
   * Construct the data object the TreasuryDepositEvent event
   * @param event The TreasuryDepositEvent event
   */
  constructor(event: Event) {
    super(event, EventType.TreasuryDeposit)

    this.value = event.data[0].toString()
  }
}

/**
 * This class represents the on-chain NFTCreatedEvent event.
 */
export class NFTCreatedEvent extends BlockchainEvent {
  nftId: number
  owner: string
  offchainData: string
  royalty: number
  collectionId?: number
  isSoulbound: string

  /**
   * Construct the data object from the NFTCreatedEvent event
   * @param event The NFTCreatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTCreated)

    this.nftId = Number.parseInt(event.data[0].toString())
    this.owner = event.data[1].toString()
    this.royalty = Number.parseInt(event.data[3].toString())
    this.collectionId = event.data[4] ? Number.parseInt(event.data[4].toString()) : undefined
    this.isSoulbound = event.data[5].toString()

    const offchainData = event.data[2].toHuman()
    this.offchainData = offchainData ? offchainData.toString() : ""
  }
}

/**
 * This class represents the on-chain NFTBurnedEvent event.
 */
export class NFTBurnedEvent extends BlockchainEvent {
  nftId: number

  /**
   * Construct the data object from the NFTBurnedEvent event
   * @param event The NFTBurnedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTBurned)

    this.nftId = Number.parseInt(event.data[0].toString())
  }
}

/**
 * This class represents the on-chain NFTDelegatedEvent event.
 */
export class NFTDelegatedEvent extends BlockchainEvent {
  nftId: number
  recipient?: string

  /**
   * Construct the data object from the NFTDelegatedEvent event
   * @param event The NFTDelegatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTDelegated)

    this.nftId = Number.parseInt(event.data[0].toString())
    this.recipient = event.data[1].toString()
  }
}

/**
 * This class represents the on-chain NFTRoyaltySetEvent event.
 */
export class NFTRoyaltySetEvent extends BlockchainEvent {
  nftId: number
  royalty: number // number ??

  /**
   * Construct the data object from the NFTRoyaltySetEvent event
   * @param event The NFTRoyaltySetEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTRoyaltySet)

    this.nftId = Number.parseInt(event.data[0].toString())
    this.royalty = Number.parseInt(event.data[1].toString())
  }
}

/**
 * This class represents the on-chain NFTTransferredEvent event.
 */
export class NFTTransferredEvent extends BlockchainEvent {
  nftId: number
  sender: string
  recipient: string

  /**
   * Construct the data object from the NFTTransferredEvent event
   * @param event The NFTTransferredEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTTransferred)

    this.nftId = Number.parseInt(event.data[0].toString())
    this.sender = event.data[1].toString()
    this.recipient = event.data[2].toString()
  }
}

/**
 * This class represents the on-chain NFTAddedToCollectionEvent event.
 */
export class NFTAddedToCollectionEvent extends BlockchainEvent {
  nftId: number
  collectionId: number

  /**
   * Construct the data object from the NFTAddedToCollectionEvent event
   * @param event The NFTAddedToCollectionEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTAddedToCollection)

    this.nftId = Number.parseInt(event.data[0].toString())
    this.collectionId = Number.parseInt(event.data[1].toString())
  }
}

/**
 * This class represents the on-chain CollectionCreatedEvent event.
 */
export class CollectionCreatedEvent extends BlockchainEvent {
  collectionId: number
  owner: string
  offchainData: string
  limit?: number

  /**
   * Construct the data object from the CollectionCreatedEvent event
   * @param event The CollectionCreatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.CollectionCreated)

    this.collectionId = Number.parseInt(event.data[0].toString())
    this.owner = event.data[1].toString()
    this.limit = event.data[3] !== undefined ? Number.parseInt(event.data[3].toString()) : undefined

    const offchainData = event.data[2].toHuman()
    this.offchainData = offchainData ? offchainData.toString() : ""
  }
}

/**
 * This class represents the on-chain blockchain CollectionLimitedEvent event.
 */
export class CollectionLimitedEvent extends BlockchainEvent {
  collectionId: number
  limit: number

  /**
   * Construct the data object from the CollectionLimitedEvent event
   * @param event The CollectionLimitedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.CollectionLimited)

    this.collectionId = Number.parseInt(event.data[0].toString())
    this.limit = Number.parseInt(event.data[1].toString())
  }
}

/**
 * This class represents the on-chain CollectionClosedEvent event.
 */
export class CollectionClosedEvent extends BlockchainEvent {
  collectionId: number

  /**
   * Construct the data object from theCollectionClosedEvent event
   * @param event The CollectionClosedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.CollectionClosed)

    this.collectionId = Number.parseInt(event.data[0].toString())
  }
}

/**
 * This class represents the on-chain CollectionBurnedEvent event.
 */
export class CollectionBurnedEvent extends BlockchainEvent {
  collectionId: number

  /**
   * Construct the data object from the CollectionBurnedEvent event
   * @param event The CollectionBurnedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.CollectionBurned)

    this.collectionId = Number.parseInt(event.data[0].toString())
  }
}

// TODO
export class ItemCompletedEvent extends BlockchainEvent {
  /**
   * Construct the data object from the ItemCompletedEvent event
   * @param event The ItemCompletedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ItemCompleted)
    // This is an empty event.
  }
}

/**
 * This class represents the on-chain BatchInterruptedEvent event,
 * when a batch of dispatches did not complete fully.
 */
export class BatchInterruptedEvent extends BlockchainEvent {
  index: number
  error: {
    module: {
      index: number
      error: string
    }
  }
  errorType: string
  details: string

  /**
   * Construct the data object from the BatchInterruptedEvent event
   * @param event The BatchInterruptedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BatchInterrupted)

    this.index = Number.parseInt(event.data[0].toString())
    this.error = event.data[1].toJSON() as {
      module: {
        index: number
        error: string
      }
    }
    this.errorType = event.data[2].toString()
    this.details = event.data[3].toString()
  }
}

/**
 * This class represents the on-chain BatchInterruptedEvent event,
 * when a batch of dispatches completed fully with no error.
 */
export class BatchCompletedEvent extends BlockchainEvent {
  /**
   * Construct the data object from the BatchCompletedEvent event
   * @param event The BatchCompletedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BatchCompleted)
    // This is an empty event.
  }
}

/**
 * This class represents the on-chain ExtrinsicFailedEvent event,
 * when an extrinsic failed.
 */
export class ExtrinsicFailedEvent extends BlockchainEvent {
  dispatchError: {
    module: {
      index: number
      error: string
    }
  }
  errorType: string
  details: string
  dispatchInfo: {
    weigth: string
    class: string
    paysFee: string
  }
  /**
   * Construct the data object from the ExtrinsicFailedEvent event
   * @param event The ExtrinsicFailedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ExtrinsicFailed)

    this.dispatchError = event.data[0].toJSON() as {
      module: {
        index: number
        error: string
      }
    }
    this.errorType = event.data[1].toString()
    this.details = event.data[2].toString()
    this.dispatchInfo = event.data[3].toJSON() as {
      weigth: string
      class: string
      paysFee: string
    }
  }
}

/**
 * This class represents the on-chain ExtrinsicSuccessEvent event,
 * when an extrinsic completed successfully.
 */
export class ExtrinsicSuccessEvent extends BlockchainEvent {
  dispatchInfo: {
    weigth: string
    class: string
    paysFee: string
  }

  /**
   * Construct the data object from the ExtrinsicSuccessEvent event
   * @param event The ExtrinsicSuccessEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ExtrinsicSuccess)

    this.dispatchInfo = event.data[0].toJSON() as {
      weigth: string
      class: string
      paysFee: string
    }
  }
}

/**
 * This class represents the on-chain NewAccountEvent event,
 * when a new account was created.
 */
export class NewAccountEvent extends BlockchainEvent {
  account: string // AccountId32

  /**
   * Construct the data object from the NewAccountEvent event
   * @param event The NewAccountEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NewAccount)

    this.account = event.data[0].toString()
  }
}

/**
 * This class represents the on-chain UnknownEvent event,
 */
export class UnknownEvent extends BlockchainEvent {
  /**
   * Construct the data object from UnknownEvent event
   * @param event The UnknownEvent event
   */
  constructor(event: Event) {
    super(event, EventType.Unknown)
    // This is an empty event.
  }
}

export class BlockchainEvents {
  inner: BlockchainEvent[]

  constructor(events: BlockchainEvent[]) {
    this.inner = events
  }

  findEvents<T extends BlockchainEvent>(ctor: new (...args: any[]) => T): T[] {
    const events = this.inner.filter((event) => event instanceof ctor)
    return events as T[]
  }

  findEvent<T extends BlockchainEvent>(ctor: new (...args: any[]) => T): T | undefined {
    const maybe_event = this.inner.find((event) => event instanceof ctor)
    return maybe_event ? (maybe_event as T) : undefined
  }

  findEventOrThrow<T extends BlockchainEvent>(ctor: new (...args: any[]) => T): T {
    const failed_event = this.inner.find((event) => event.type == EventType.ExtrinsicFailed)
    const target_event = this.inner.find((event) => event instanceof ctor)

    if (failed_event) {
      throw new Error(Errors.EXTRINSIC_FAILED)
    }

    if (target_event == undefined) {
      throw new Error(Errors.EVENT_NOT_FOUND)
    }

    return target_event as T
  }
}
