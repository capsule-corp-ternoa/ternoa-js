import { Event } from "@polkadot/types/interfaces/system"
import { bnToBn, hexToString } from "@polkadot/util"

import { roundBalance } from "./helpers/utils"
import { Errors } from "./constants"
import { MarketplaceConfigFeeType, MarketplaceKind } from "./marketplace/enum"
import { AcceptanceAction, CancellationFeeAction, DurationAction, RentFeeAction, RevocationAction } from "./rent/enum"

export enum EventType {
  //Assets
  AssetTransferred = "assets.Transferred",

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

  //Rent
  ContractCreated = "rent.ContractCreated",
  ContractStarted = "rent.ContractStarted",
  ContractRevoked = "rent.ContractRevoked",
  ContractOfferCreated = "rent.ContractOfferCreated",
  ContractOfferRetracted = "rent.ContractOfferRetracted",
  ContractSubscriptionTermsChanged = "rent.ContractSubscriptionTermsChanged",
  ContractSubscriptionTermsAccepted = "rent.ContractSubscriptionTermsAccepted",
  ContractEnded = "rent.ContractEnded",
  ContractSubscriptionPeriodStarted = "rent.ContractSubscriptionPeriodStarted",
  ContractAvailableExpired = "rent.ContractAvailableExpired",

  // Marketplace
  MarketplaceCreated = "marketplace.MarketplaceCreated",
  MarketplaceOwnerSet = "marketplace.MarketplaceOwnerSet",
  MarketplaceKindSet = "marketplace.MarketplaceKindSet",
  MarketplaceConfigSet = "marketplace.MarketplaceConfigSet",
  MarketplaceMintFeeSet = "marketplace.MarketplaceMintFeeSet",
  NFTListed = "marketplace.NFTListed",
  NFTUnlisted = "marketplace.NFTUnlisted",
  NFTSold = "marketplace.NFTSold",

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
      // Assets
      case EventType.AssetTransferred:
        return new AssetTransferredEvent(event)
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
      // Rent
      case EventType.ContractCreated:
        return new ContractCreatedEvent(event)
      case EventType.ContractStarted:
        return new ContractStartedEvent(event)
      case EventType.ContractRevoked:
        return new ContractRevokedEvent(event)
      case EventType.ContractOfferCreated:
        return new ContractOfferCreatedEvent(event)
      case EventType.ContractOfferRetracted:
        return new ContractOfferRetractedEvent(event)
      case EventType.ContractSubscriptionTermsChanged:
        return new ContractSubscriptionTermsChangedEvent(event)
      case EventType.ContractSubscriptionTermsAccepted:
        return new ContractSubscriptionTermsAcceptedEvent(event)
      case EventType.ContractEnded:
        return new ContractEndedEvent(event)
      case EventType.ContractSubscriptionPeriodStarted:
        return new ContractSubscriptionPeriodStartedEvent(event)
      case EventType.ContractAvailableExpired:
        return new ContractAvailableExpiredEvent(event)
      // Marketplace
      case EventType.MarketplaceCreated:
        return new MarketplaceCreatedEvent(event)
      case EventType.MarketplaceOwnerSet:
        return new MarketplaceOwnerSetEvent(event)
      case EventType.MarketplaceKindSet:
        return new MarketplaceKindSetEvent(event)
      case EventType.MarketplaceConfigSet:
        return new MarketplaceConfigSetEvent(event)
      case EventType.MarketplaceMintFeeSet:
        return new MarketplaceMintFeeSetEvent(event)
      case EventType.NFTListed:
        return new NFTListedEvent(event)
      case EventType.NFTUnlisted:
        return new NFTUnlistedEvent(event)
      case EventType.NFTSold:
        return new NFTSoldEvent(event)
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
 * This class represents the on-chain AssetTransferredEvent event.
 */
export class AssetTransferredEvent extends BlockchainEvent {
  assetId: number
  from: string // AccountId32
  to: string // AccountId32
  amount: string
  amountRounded: number

  /**
   * Construct the data object from the AssetTransferredEvent event
   * @param event The AssetTransferredEvent event
   */
  constructor(event: Event) {
    super(event, EventType.AssetTransferred)
    const [assetId, from, to, amount] = event.data

    this.assetId = Number.parseInt(assetId.toString())
    this.from = from.toString()
    this.to = to.toString()
    this.amount = bnToBn(amount.toString()).toString()
    this.amountRounded = roundBalance(this.amount)
  }
}

/**
 * This class represents the on-chain BalancesWithdrawEvent event.
 */
export class BalancesWithdrawEvent extends BlockchainEvent {
  who: string //AccountId32
  amount: string // u128
  amountRounded: number

  /**
   * Construct the data object from the BalancesWithdrawEvent event
   * @param event The BalancesWithdrawEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesWithdraw)

    this.who = event.data[0].toString()
    this.amount = event.data[1].toString()
    this.amountRounded = roundBalance(this.amount)
  }
}

/**
 * This class represents the on-chain BalancesDepositEvent event.
 */
export class BalancesDepositEvent extends BlockchainEvent {
  who: string // AccountId32
  amount: string // u128
  amountRounded: number

  /**
   * Construct the data object from the BalancesDepositEvent event
   * @param event The BalancesDepositEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesDeposit)
    const [who, amount] = event.data

    this.who = who.toString()
    this.amount = amount.toString()
    this.amountRounded = roundBalance(this.amount)
  }
}

/**
 * This class represents the on-chain BalancesTransferEvent event.
 */
export class BalancesTransferEvent extends BlockchainEvent {
  from: string // AccountId32
  to: string // AccountId32
  amount: string // u128
  amountRounded: number

  /**
   * Construct the data object from the BalancesTransferEvent event
   * @param event The BalancesTransferEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesTransfer)
    const [from, to, amount] = event.data

    this.from = from.toString()
    this.to = to.toString()
    this.amount = amount.toString()
    this.amountRounded = roundBalance(this.amount)
  }
}

/**
 *  This class represents the on-chain BalancesEndowedEvent event.
 */
export class BalancesEndowedEvent extends BlockchainEvent {
  account: string // AccountId32
  freeBalance: string // u128
  freeBalanceRounded: number

  /**
   * Construct the data object from the BalancesEndowedEvent event
   * @param event The BalancesEndowedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BalancesEndowed)
    const [account, freeBalance] = event.data

    this.account = account.toString()
    this.freeBalance = freeBalance.toString()
    this.freeBalanceRounded = roundBalance(this.freeBalance)
  }
}

/**
 * This class represents the on-chain TreasuryDepositEvent event.
 */
export class TreasuryDepositEvent extends BlockchainEvent {
  value: string // u128
  valueRounded: number

  /**
   * Construct the data object the TreasuryDepositEvent event
   * @param event The TreasuryDepositEvent event
   */
  constructor(event: Event) {
    super(event, EventType.TreasuryDeposit)
    const [value] = event.data

    this.value = value.toString()
    this.valueRounded = roundBalance(this.value)
  }
}

/**
 * This class represents the on-chain NFTCreatedEvent event.
 */
export class NFTCreatedEvent extends BlockchainEvent {
  nftId: number
  owner: string // AccountId32
  offchainData: string
  royalty: number
  collectionId: number | null
  isSoulbound: boolean
  mintFee: string // u128
  mintFeeRounded: number

  /**
   * Construct the data object from the NFTCreatedEvent event
   * @param event The NFTCreatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTCreated)
    const [nftId, owner, offchainData, royalty, collectionId, isSoulbound, mintFee] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.owner = owner.toString()
    this.royalty = Number.parseInt(royalty.toString()) / 10000
    this.collectionId = Number.parseInt(collectionId.toString()) || null
    this.isSoulbound = isSoulbound.toString() === "true"
    this.offchainData = hexToString(offchainData.toString())
    this.mintFee = mintFee.toString()
    this.mintFeeRounded = roundBalance(this.mintFee)
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
    const [nftId] = event.data

    this.nftId = Number.parseInt(nftId.toString())
  }
}

/**
 * This class represents the on-chain NFTDelegatedEvent event.
 */
export class NFTDelegatedEvent extends BlockchainEvent {
  nftId: number
  recipient: string | null // AccountId32

  /**
   * Construct the data object from the NFTDelegatedEvent event
   * @param event The NFTDelegatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTDelegated)
    const [nftId, recipient] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.recipient = recipient?.toString() || null
  }
}

/**
 * This class represents the on-chain NFTRoyaltySetEvent event.
 */
export class NFTRoyaltySetEvent extends BlockchainEvent {
  nftId: number
  royalty: number

  /**
   * Construct the data object from the NFTRoyaltySetEvent event
   * @param event The NFTRoyaltySetEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTRoyaltySet)
    const [nftId, royalty] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.royalty = Number.parseInt(royalty.toString()) / 10000
  }
}

/**
 * This class represents the on-chain NFTTransferredEvent event.
 */
export class NFTTransferredEvent extends BlockchainEvent {
  nftId: number
  sender: string // AccountId32
  recipient: string // AccountId32

  /**
   * Construct the data object from the NFTTransferredEvent event
   * @param event The NFTTransferredEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTTransferred)
    const [nftId, sender, recipient] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.sender = sender.toString()
    this.recipient = recipient.toString()
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
    const [nftId, collectionId] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.collectionId = Number.parseInt(collectionId.toString())
  }
}

/**
 * This class represents the on-chain CollectionCreatedEvent event.
 */
export class CollectionCreatedEvent extends BlockchainEvent {
  collectionId: number
  owner: string // AccountId32
  offchainData: string
  limit: number | null

  /**
   * Construct the data object from the CollectionCreatedEvent event
   * @param event The CollectionCreatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.CollectionCreated)
    const [collectionId, owner, offchainData, limit] = event.data

    this.collectionId = Number.parseInt(collectionId.toString())
    this.owner = owner.toString()
    this.limit = Number.parseInt(limit.toString()) || null
    this.offchainData = hexToString(offchainData.toString())
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
    const [collectionId, limit] = event.data

    this.collectionId = Number.parseInt(collectionId.toString())
    this.limit = Number.parseInt(limit.toString())
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
    const [collectionId] = event.data

    this.collectionId = Number.parseInt(collectionId.toString())
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
    const [collectionId] = event.data

    this.collectionId = Number.parseInt(collectionId.toString())
  }
}

/**
 * This class represents the on-chain ContractCreatedEvent event.
 */
export class ContractCreatedEvent extends BlockchainEvent {
  nftId: number
  renter: string
  durationType?: string
  blockDuration?: number | null
  blockSubscriptionRenewal?: number | null
  acceptanceType?: string
  acceptanceList?: string[]
  revocationType?: string
  rentFeeType?: string
  rentFee?: string | number
  rentFeeRounded?: number
  renterCancellationFeeType?: string | null
  renterCancellationFee?: string | number | null
  renterCancellationFeeRounded?: number | null
  renteeCancellationFeeType?: string | null
  renteeCancellationFee?: string | number | null
  renteeCancellationFeeRounded?: number | null

  /**
   * Construct the data object from the ContractCreatedEvent event
   * @param event The ContractCreatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractCreated)
    const [
      nftId,
      renter,
      duration,
      acceptanceType,
      revocationType,
      rentFee,
      renterCancellationFee,
      renteeCancellationFee,
    ] = event.data

    const parsedDuration = duration.toString() !== DurationAction.Infinite && JSON.parse(duration.toString())
    const isDurationFixed = parsedDuration && parsedDuration.fixed
    const isDurationSubscription = parsedDuration && parsedDuration.subscription //toString() ?
    const parsedAcceptance = JSON.parse(acceptanceType.toString())
    const isAutoAcceptance = parsedAcceptance.autoAcceptance === null || parsedAcceptance.autoAcceptance //toString() ?
    const isrevocationTypeNoRevocation = revocationType.toString() === RevocationAction.NoRevocation
    const isrevocationTypeOnSubscriptionChange = revocationType.toString() === RevocationAction.OnSubscriptionChange
    const parsedRentFee = JSON.parse(rentFee.toString())
    const isRentFeeToken = parsedRentFee.tokens //toString() ?
    const parsedRenterCancellationFee = renterCancellationFee.toString() && JSON.parse(renterCancellationFee.toString())
    const isRenterCancellationFeeFixed = parsedRenterCancellationFee && parsedRenterCancellationFee.fixedTokens //toString() ?
    const isRenterCancellationFeeFlexible = parsedRenterCancellationFee && parsedRenterCancellationFee.flexibleTokens //toString() ?
    const isRenterCancellationFeeNft = parsedRenterCancellationFee && parsedRenterCancellationFee.nft
    const parsedRenteeCancellationFee = renteeCancellationFee.toString() && JSON.parse(renteeCancellationFee.toString())
    const isRenteeCancellationFeeFixed = parsedRenterCancellationFee && parsedRenteeCancellationFee.fixedTokens //toString() ?
    const isRenteeCancellationFeeFlexible = parsedRenterCancellationFee && parsedRenteeCancellationFee.flexibleTokens //toString() ?
    const isRenteeCancellationFeeNft = parsedRenteeCancellationFee && parsedRenteeCancellationFee.nft

    this.nftId = Number.parseInt(nftId.toString())
    this.renter = renter.toString()
    this.durationType = undefined
    this.blockDuration = undefined
    this.blockSubscriptionRenewal = undefined
    this.acceptanceType = undefined
    this.acceptanceList = undefined
    this.revocationType = undefined
    this.rentFeeType = undefined
    this.rentFee = undefined
    this.rentFeeRounded = undefined
    this.renterCancellationFeeType = undefined
    this.renterCancellationFee = undefined
    this.renterCancellationFeeRounded = undefined
    this.renteeCancellationFeeType = undefined
    this.renteeCancellationFee = undefined
    this.renteeCancellationFeeRounded = undefined

    if (isDurationFixed) {
      this.durationType = DurationAction.Fixed
      this.blockDuration = Number.parseInt(parsedDuration.fixed.toString())
    } else if (isDurationSubscription) {
      this.durationType = DurationAction.Subscription
      this.blockDuration = Number.parseInt(parsedDuration.subscription[0].toString()) //TBC with Extrinsic
      this.blockSubscriptionRenewal =
        parsedDuration.subscription[1] && Number.parseInt(parsedDuration.subscription[1].toString()) //TBC with Extrinsic
    } else {
      this.durationType = DurationAction.Infinite
    }

    if (isAutoAcceptance) {
      this.acceptanceType = AcceptanceAction.AutoAcceptance
      this.acceptanceList = []
      parsedAcceptance.autoAcceptance &&
        parsedAcceptance.autoAcceptance.map((account: string) => this.acceptanceList?.push(account.toString()))
    } else {
      this.acceptanceType = AcceptanceAction.ManualAcceptance
      this.acceptanceList = []
      parsedAcceptance.manualAcceptance &&
        parsedAcceptance.manualAcceptance.map((account: string) => this.acceptanceList?.push(account.toString()))
    }

    if (isrevocationTypeNoRevocation) {
      this.revocationType = RevocationAction.NoRevocation
    } else if (isrevocationTypeOnSubscriptionChange) {
      this.revocationType = RevocationAction.OnSubscriptionChange
    } else {
      this.revocationType = RevocationAction.Anytime
    }

    if (isRentFeeToken) {
      this.rentFeeType = RentFeeAction.Tokens
      this.rentFee = bnToBn(isRentFeeToken).toString()
      this.rentFeeRounded = roundBalance(this.rentFee)
    } else {
      this.rentFeeType = RentFeeAction.NFT
      this.rentFee = Number.parseInt(parsedRentFee.nft.toString())
      this.rentFeeRounded = this.rentFee
    }

    if (isRenterCancellationFeeFixed) {
      this.renterCancellationFeeType = CancellationFeeAction.FixedTokens
      this.renterCancellationFee = bnToBn(parsedRenterCancellationFee.fixedTokens).toString()
      this.renterCancellationFeeRounded = roundBalance(this.renterCancellationFee)
    } else if (isRenterCancellationFeeFlexible) {
      this.renterCancellationFeeType = CancellationFeeAction.FlexibleTokens
      this.renterCancellationFee = bnToBn(parsedRenterCancellationFee.flexibleTokens).toString()
      this.renterCancellationFeeRounded = roundBalance(this.renterCancellationFee)
    } else if (isRenterCancellationFeeNft) {
      this.renterCancellationFeeType = CancellationFeeAction.NFT
      this.renterCancellationFee = Number.parseInt(parsedRenterCancellationFee.nft.toString())
      this.renterCancellationFeeRounded = this.renterCancellationFee
    }

    if (isRenteeCancellationFeeFixed) {
      this.renteeCancellationFeeType = CancellationFeeAction.FixedTokens
      this.renteeCancellationFee = bnToBn(parsedRenteeCancellationFee.fixedTokens).toString()
      this.renteeCancellationFeeRounded = roundBalance(this.renteeCancellationFee)
    } else if (isRenteeCancellationFeeFlexible) {
      this.renteeCancellationFeeType = CancellationFeeAction.FlexibleTokens
      this.renteeCancellationFee = bnToBn(parsedRenteeCancellationFee.flexibleTokens).toString()
      this.renteeCancellationFeeRounded = roundBalance(this.renteeCancellationFee)
    } else if (isRenteeCancellationFeeNft) {
      this.renteeCancellationFeeType = CancellationFeeAction.NFT
      this.renteeCancellationFee = Number.parseInt(parsedRenteeCancellationFee.nft.toString())
      this.renteeCancellationFeeRounded = this.renteeCancellationFee
    }
  }
}

/**
 * This class represents the on-chain ContractStartedEvent event.
 */
export class ContractStartedEvent extends BlockchainEvent {
  nftId: number
  rentee: string

  /**
   * Construct the data object from the ContractStartedEvent event
   * @param event The ContractStartedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractStarted)
    const [nftId, rentee] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.rentee = rentee.toString()
  }
}

/**
 * This class represents the on-chain ContractRevokedEvent event.
 */
export class ContractRevokedEvent extends BlockchainEvent {
  nftId: number
  revokedBy: string

  /**
   * Construct the data object from the ContractRevokedEvent event
   * @param event The ContractRevokedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractRevoked)
    const [nftId, revokedBy] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.revokedBy = revokedBy.toString()
  }
}

/**
 * This class represents the on-chain ContractOfferCreatedEvent event.
 */
export class ContractOfferCreatedEvent extends BlockchainEvent {
  nftId: number
  rentee: string

  /**
   * Construct the data object from the ContractOfferCreatedEvent event
   * @param event The ContractOfferCreatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractOfferCreated)
    const [nftId, rentee] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.rentee = rentee.toString()
  }
}

/**
 * This class represents the on-chain ContractOfferRetractedEvent event.
 */
export class ContractOfferRetractedEvent extends BlockchainEvent {
  nftId: number
  rentee: string

  /**
   * Construct the data object from the ContractOfferRetractedEvent event
   * @param event The ContractOfferRetractedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractOfferRetracted)
    const [nftId, rentee] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.rentee = rentee.toString()
  }
}

/**
 * This class represents the on-chain ContractSubscriptionTermsChangedEvent event.
 */
export class ContractSubscriptionTermsChangedEvent extends BlockchainEvent {
  nftId: number
  durationType?: string
  blockDuration?: number | null
  blockSubscriptionRenewal?: number | null
  rentFeeType?: string
  rentFee?: string | number
  rentFeeRounded?: number

  /**
   * Construct the data object from the ContractSubscriptionTermsChangedEvent event
   * @param event The ContractSubscriptionTermsChangedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractSubscriptionTermsChanged)
    const [nftId, duration, rentFee] = event.data

    const parsedDuration = JSON.parse(duration.toString())
    const isDurationFixed = parsedDuration.Fixed //toString() ?
    const isDurationSubscription = parsedDuration.Subscription //toString() ?
    const parsedRentFee = JSON.parse(rentFee.toString())
    const isRentFeeToken = parsedRentFee.Token //toString() ?

    this.nftId = Number.parseInt(nftId.toString())
    this.durationType = undefined
    this.blockDuration = undefined
    this.blockSubscriptionRenewal = undefined
    this.rentFeeType = undefined
    this.rentFee = undefined
    this.rentFeeRounded = undefined

    if (isDurationFixed) {
      this.durationType = DurationAction.Fixed
      this.blockDuration = Number.parseInt(parsedDuration.Fixed.toString())
    } else if (isDurationSubscription) {
      this.durationType = DurationAction.Subscription
      this.blockDuration = Number.parseInt(parsedDuration.Subscription[0].toString()) //TBC with Extrinsic
      this.blockSubscriptionRenewal = Number.parseInt(parsedDuration.Subscription[1].toString()) //TBC with Extrinsic
    } else {
      this.durationType = DurationAction.Infinite
    }

    if (isRentFeeToken) {
      this.rentFeeType = RentFeeAction.Tokens
      this.rentFee = bnToBn(isRentFeeToken).toString()
      this.rentFeeRounded = roundBalance(this.rentFee)
    } else {
      this.rentFeeType = RentFeeAction.NFT
      this.rentFee = Number.parseInt(parsedRentFee.NFT.toString())
      this.rentFeeRounded = this.rentFee
    }
  }
}

/**
 * This class represents the on-chain ContractSubscriptionTermsAcceptedEvent event.
 */
export class ContractSubscriptionTermsAcceptedEvent extends BlockchainEvent {
  nftId: number

  /**
   * Construct the data object from the ContractSubscriptionTermsAcceptedEvent event
   * @param event The ContractSubscriptionTermsAcceptedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractSubscriptionTermsAccepted)
    const [nftId] = event.data

    this.nftId = Number.parseInt(nftId.toString())
  }
}

/**
 * This class represents the on-chain ContractEndedEvent event.
 */
export class ContractEndedEvent extends BlockchainEvent {
  nftId: number
  revokedBy: string

  /**
   * Construct the data object from the ContractEndedEvent event
   * @param event The ContractEndedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractEnded)
    const [nftId, revokedBy] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.revokedBy = revokedBy.toString()
  }
}

/**
 * This class represents the on-chain ContractSubscriptionPeriodStartedEvent event.
 */
export class ContractSubscriptionPeriodStartedEvent extends BlockchainEvent {
  nftId: number

  /**
   * Construct the data object from the ContractSubscriptionPeriodStartedEvent event
   * @param event The ContractSubscriptionPeriodStartedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractSubscriptionPeriodStarted)
    const [nftId] = event.data

    this.nftId = Number.parseInt(nftId.toString())
  }
}

/**
 * This class represents the on-chain ContractAvailableExpiredEvent event.
 */
export class ContractAvailableExpiredEvent extends BlockchainEvent {
  nftId: number

  /**
   * Construct the data object from the ContractAvailableExpiredEvent event
   * @param event The ContractAvailableExpiredEvent event
   */
  constructor(event: Event) {
    super(event, EventType.ContractAvailableExpired)
    const [nftId] = event.data

    this.nftId = Number.parseInt(nftId.toString())
  }
}

/**
 * This class represents the on-chain MarketplaceCreatedEvent event.
 */
export class MarketplaceCreatedEvent extends BlockchainEvent {
  marketplaceId: number
  owner: string // AccountId32
  kind: MarketplaceKind // Public / Private

  /**
   * Construct the data object from MarketplaceCreatedEvent event
   * @param event The MarketplaceCreatedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.MarketplaceCreated)

    this.marketplaceId = Number.parseInt(event.data[0].toString())
    this.owner = event.data[1].toString()
    this.kind = event.data[2].toString() == "Public" ? MarketplaceKind.Public : MarketplaceKind.Private
  }
}

/**
 * This class represents the on-chain MarketplaceConfigSetEvent event.
 */
export class MarketplaceConfigSetEvent extends BlockchainEvent {
  marketplaceId: number
  commissionFeeType?: string | null
  commissionFee?: string | null
  commissionFeeRounded?: number | null
  listingFeeType?: string | null
  listingFee?: string | null
  listingFeeRounded?: number | null
  accountList?: string[]
  offchainData?: string | null

  /**
   * Construct the data object from MarketplaceConfigSetEvent event
   * @param event The MarketplaceConfigSetEvent event
   */
  constructor(event: Event) {
    super(event, EventType.MarketplaceConfigSet)
    const [marketplaceId, commissionFee, listingFee, accountList, offchainData] = event.data

    const isCommissionFeeSet = commissionFee.toString() !== "Noop" && commissionFee.toString() !== "Remove"
    const isCommissionFeeRemoved = commissionFee.toString() === "Remove"
    const isListingFeeSet = listingFee.toString() !== "Noop" && listingFee.toString() !== "Remove"
    const isListingFeeRemoved = listingFee.toString() === "Remove"
    const isAccountListSet = accountList.toString() !== "Noop" && accountList.toString() !== "Remove"
    const isAccountListRemoved = accountList.toString() === "Remove"
    const isOffchainDataSet = offchainData.toString() !== "Noop" && offchainData.toString() !== "Remove"
    const isOffchainDataRemoved = offchainData.toString() === "Remove"

    this.marketplaceId = Number.parseInt(marketplaceId.toString())
    this.commissionFeeType = undefined
    this.commissionFee = undefined
    this.commissionFeeRounded = undefined
    this.listingFeeType = undefined
    this.listingFee = undefined
    this.listingFeeRounded = undefined
    this.accountList = undefined
    this.offchainData = undefined

    if (isCommissionFeeSet) {
      const parsedDatas = JSON.parse(commissionFee.toString())
      parsedDatas.set.flat
        ? ((this.commissionFee = bnToBn(parsedDatas.set.flat).toString()),
          (this.commissionFeeRounded = roundBalance(this.commissionFee)),
          (this.commissionFeeType = MarketplaceConfigFeeType.Flat))
        : ((this.commissionFee = String(Number(parsedDatas.set.percentage.toString()) / 10000)),
          (this.commissionFeeRounded = Number(this.commissionFee)),
          (this.commissionFeeType = MarketplaceConfigFeeType.Percentage))
    } else if (isCommissionFeeRemoved) {
      this.commissionFee = null
      this.commissionFeeRounded = null
      this.commissionFeeType = null
    }

    if (isListingFeeSet) {
      const parsedDatas = JSON.parse(listingFee.toString())
      parsedDatas.set.flat
        ? ((this.listingFee = bnToBn(parsedDatas.set.flat).toString()),
          (this.listingFeeRounded = roundBalance(this.listingFee)),
          (this.listingFeeType = MarketplaceConfigFeeType.Flat))
        : ((this.listingFee = String(Number(parsedDatas.set.percentage.toString()) / 10000)),
          (this.listingFeeRounded = Number(this.listingFee)),
          (this.listingFeeType = MarketplaceConfigFeeType.Percentage))
    } else if (isListingFeeRemoved) {
      this.listingFee = null
      this.listingFeeRounded = null
      this.listingFeeType = null
    }

    if (isAccountListSet) {
      this.accountList = []
      const parsedDatas = JSON.parse(accountList.toString())
      parsedDatas.set.map((account: string) => this.accountList?.push(account.toString()))
    } else if (isAccountListRemoved) {
      this.accountList = []
    }

    if (isOffchainDataSet) {
      const parsedDatas = JSON.parse(offchainData.toString())
      this.offchainData = hexToString(parsedDatas.set.toString())
    } else if (isOffchainDataRemoved) {
      this.offchainData = null
    }
  }
}

/**
 * This class represents the on-chain MarketplaceOwnerSetEvent event.
 */
export class MarketplaceOwnerSetEvent extends BlockchainEvent {
  marketplaceId: number
  owner: string // AccountId32

  /**
   * Construct the data object from MarketplaceOwnerSetEvent event
   * @param event The MarketplaceOwnerSetEvent event
   */
  constructor(event: Event) {
    super(event, EventType.MarketplaceOwnerSet)
    const [marketplaceId, owner] = event.data

    this.marketplaceId = Number.parseInt(marketplaceId.toString())
    this.owner = owner.toString()
  }
}

/**
 * This class represents the on-chain MarketplaceKindSetEvent event.
 */
export class MarketplaceKindSetEvent extends BlockchainEvent {
  marketplaceId: number
  kind: MarketplaceKind // Public / Private

  /**
   * Construct the data object from MarketplaceKindSetEvent event
   * @param event The MarketplaceKindSetEvent event
   */
  constructor(event: Event) {
    super(event, EventType.MarketplaceKindSet)
    const [marketplaceId, kind] = event.data

    this.marketplaceId = Number.parseInt(marketplaceId.toString())
    this.kind = kind.toString() == "Public" ? MarketplaceKind.Public : MarketplaceKind.Private
  }
}

/**
 * This class represents the on-chain MarketplaceMintFeeSetEvent event.
 */
export class MarketplaceMintFeeSetEvent extends BlockchainEvent {
  fee: string
  feeRounded: number

  /**
   * Construct the data object from MarketplaceMintFeeSetEvent event
   * @param event The MarketplaceMintFeeSetEvent event
   */
  constructor(event: Event) {
    super(event, EventType.MarketplaceMintFeeSet)
    const [fee] = event.data

    this.fee = fee.toString()
    this.feeRounded = roundBalance(this.fee)
  }
}

/**
 * This class represents the on-chain NFTListedEvent event.
 */
export class NFTListedEvent extends BlockchainEvent {
  nftId: number
  marketplaceId: number
  price: string
  priceRounded: number
  commissionFeeType?: string | null
  commissionFee?: string | null
  commissionFeeRounded?: number | null

  /**
   * Construct the data object from NFTListedEvent event
   * @param event The NFTListedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTListed)
    const [nftId, marketplaceId, price, commissionFee] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.marketplaceId = Number.parseInt(marketplaceId.toString())
    this.price = price.toString()
    this.priceRounded = roundBalance(this.price)
    this.commissionFeeType = undefined
    this.commissionFee = undefined
    this.commissionFeeRounded = undefined

    const parsedCommissionFee = commissionFee.toString() && JSON.parse(commissionFee.toString())
    const isMarketplaceCommissionFeeFlat = parsedCommissionFee && parsedCommissionFee.flat
    const isMarketplaceCommissionFeePercentage = parsedCommissionFee && parsedCommissionFee.percentage
    if (isMarketplaceCommissionFeeFlat) {
      this.commissionFeeType = MarketplaceConfigFeeType.Flat
      this.commissionFee = bnToBn(parsedCommissionFee.flat).toString()
      this.commissionFeeRounded = roundBalance(this.commissionFee)
    } else if (isMarketplaceCommissionFeePercentage) {
      this.commissionFeeType = MarketplaceConfigFeeType.Percentage
      this.commissionFee = String(Number(parsedCommissionFee.percentage.toString()) / 10000)
      this.commissionFeeRounded = Number(this.commissionFee)
    }
  }
}

/**
 * This class represents the on-chain NFTUnlistedEvent event.
 */
export class NFTUnlistedEvent extends BlockchainEvent {
  nftId: number

  /**
   * Construct the data object from NFTUnlistedEvent event
   * @param event The NFTUnlistedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTUnlisted)
    const [nftId] = event.data

    this.nftId = Number.parseInt(nftId.toString())
  }
}

/**
 * This class represents the on-chain NFTSoldEvent event.
 */
export class NFTSoldEvent extends BlockchainEvent {
  nftId: number
  marketplaceId: number
  buyer: string
  listedPrice: string
  listedPriceRounded: number
  marketplaceCut: string
  marketplaceCutRounded: number
  royaltyCut: string
  royaltyCutRounded: number

  /**
   * Construct the data object from NFTSoldEvent event
   * @param event The NFTSoldEvent event
   */
  constructor(event: Event) {
    super(event, EventType.NFTSold)
    const [nftId, marketplaceId, buyer, listedPrice, marketplaceCut, royaltyCut] = event.data

    this.nftId = Number.parseInt(nftId.toString())
    this.marketplaceId = Number.parseInt(marketplaceId.toString())
    this.buyer = buyer.toString()
    this.listedPrice = listedPrice.toString()
    this.listedPriceRounded = roundBalance(this.listedPrice)
    this.marketplaceCut = marketplaceCut.toString()
    this.marketplaceCutRounded = roundBalance(this.marketplaceCut)
    this.royaltyCut = royaltyCut.toString()
    this.royaltyCutRounded = roundBalance(this.royaltyCut)
  }
}

/**
 * This class represents the on-chain ItemCompletedEvent event,
 * when a single item within a Batch of dispatches has completed with no error.
 */
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
  errorType?: string
  details?: string

  /**
   * Construct the data object from the BatchInterruptedEvent event
   * @param event The BatchInterruptedEvent event
   */
  constructor(event: Event) {
    super(event, EventType.BatchInterrupted)
    const [index, error, errorType, details] = event.data

    this.index = Number.parseInt(index.toString())
    this.error = error.toJSON() as {
      module: {
        index: number
        error: string
      }
    }
    this.errorType = errorType?.toString()
    this.details = details?.toString()
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
  errorType?: string
  details?: string
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
    const [dispatchError, errorType, details, dispatchInfo] = event.data

    this.dispatchError = dispatchError.toJSON() as {
      module: {
        index: number
        error: string
      }
    }
    this.errorType = errorType?.toString()
    this.details = details?.toString()
    this.dispatchInfo = dispatchInfo?.toJSON() as {
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
    const [dispatchInfo] = event.data

    this.dispatchInfo = dispatchInfo.toJSON() as {
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
    const [account] = event.data

    this.account = account.toString()
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
