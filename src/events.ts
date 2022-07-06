import { Event } from "@polkadot/types/interfaces/system";
import { MarketplaceKind } from "./constants";

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
    Unknown = "Unknown"
}

export class BlockchainEvent {
    type: EventType;
    raw: Event;
    section: string;
    method: string;

    constructor(raw: Event, type: EventType) {
        this.raw = raw;
        this.type = type;
        this.section = raw.section;
        this.method = raw.method;
    }

    static fromEvent(event: Event): BlockchainEvent {
        const name = event.section + "." + event.method;
        switch (name) {
            // Balances
            case EventType.BalancesWithdraw:
                return new BalancesWithdrawEvent(event);
            case EventType.BalancesDeposit:
                return new BalancesDepositEvent(event);
            case EventType.BalancesTransfer:
                return new BalancesTransferEvent(event);
            case EventType.BalancesEndowed:
                return new BalancesEndowedEvent(event);
            // Treasury
            case EventType.TreasuryDeposit:
                return new TreasuryDepositEvent(event);
            // NFT
            case EventType.NFTCreated:
                return new NFTCreatedEvent(event);
            case EventType.NFTBurned:
                return new NFTBurnedEvent(event);
            case EventType.NFTDelegated:
                return new NFTDelegatedEvent(event);
            case EventType.NFTRoyaltySet:
                return new NFTRoyaltySetEvent(event);
            case EventType.NFTTransferred:
                return new NFTTransferredEvent(event);
            case EventType.NFTAddedToCollection:
                return new NFTAddedToCollectionEvent(event);
            case EventType.CollectionCreated:
                return new CollectionCreatedEvent(event);
            case EventType.CollectionLimited:
                return new CollectionLimitedEvent(event);
            case EventType.CollectionClosed:
                return new CollectionClosedEvent(event);
            case EventType.CollectionBurned:
                return new CollectionBurnedEvent(event);
            // Marketplace
            case EventType.MarketplaceCreated:
                return new MarketplaceCreatedEvent(event);
            case EventType.MarketplaceOwnerSet:
                return new MarketplaceOwnerSetEvent(event);
            case EventType.MarketplaceKindSet:
                return new MarketplaceKindSetEvent(event);
            case EventType.MarketplaceConfigSet:
                return new MarketplaceConfigSetEvent(event);
            case EventType.MarketplaceMintFeeSet:
                return new MarketplaceMintFeeSetEvent(event);
            case EventType.NFTListed:
                return new NFTListedEvent(event);
            case EventType.NFTUnlisted:
                return new NFTUnlistedEvent(event);
            case EventType.NFTSold:
                return new NFTSoldEvent(event);
            // Utility
            case EventType.ItemCompleted:
                return new ItemCompletedEvent(event);
            case EventType.BatchInterrupted:
                return new BatchInterruptedEvent(event);
            case EventType.BatchCompleted:
                return new BatchCompletedEvent(event);
            // System
            case EventType.ExtrinsicFailed:
                return new ExtrinsicFailedEvent(event);
            case EventType.ExtrinsicSuccess:
                return new ExtrinsicSuccessEvent(event);
            case EventType.NewAccount:
                return new NewAccountEvent(event);
        };

        return new UnknownEvent(event);
    }
}

// TODO
export class BalancesWithdrawEvent extends BlockchainEvent {
    who: string;        //AccountId32
    amount: string;     // u128

    constructor(event: Event) {
        super(event, EventType.BalancesWithdraw);

        this.who = event.data[0].toString();
        this.amount = event.data[1].toString();
    }
}

// TODO
export class BalancesDepositEvent extends BlockchainEvent {
    who: string;        // AccountId32
    amount: string;     // u128

    constructor(event: Event) {
        super(event, EventType.BalancesDeposit);

        this.who = event.data[0].toString();
        this.amount = event.data[1].toString();
    }
}

// TODO
export class BalancesTransferEvent extends BlockchainEvent {
    from: string;       // AccountId32
    to: string;         // AccountId32
    amount: string;     // u128

    constructor(event: Event) {
        super(event, EventType.BalancesTransfer);

        this.from = event.data[0].toString();
        this.to = event.data[1].toString();
        this.amount = event.data[2].toString();
    }
}

// TODO
export class BalancesEndowedEvent extends BlockchainEvent {
    account: string;        // AccountId32
    freeBalance: string;    // u128

    constructor(event: Event) {
        super(event, EventType.BalancesEndowed);

        this.account = event.data[0].toString();
        this.freeBalance = event.data[1].toString();
    }
}

// TODO
export class TreasuryDepositEvent extends BlockchainEvent {
    value: string;      // u128

    constructor(event: Event) {
        super(event, EventType.TreasuryDeposit);

        this.value = event.data[0].toString();
    }
}

// TODO
export class NFTCreatedEvent extends BlockchainEvent {
    nftId: number;
    owner: string;
    offchainData: string;
    royalty: string;
    collectionId: string | null;
    isSoulbound: string;

    constructor(event: Event) {
        super(event, EventType.NFTCreated);

        this.nftId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
        this.royalty = event.data[3].toString();
        this.collectionId = event.data[4].toString();
        this.isSoulbound = event.data[5].toString();

        let offchainData = event.data[2].toHuman();
        this.offchainData = offchainData ? offchainData.toString() : "";
    }
}

// TODO
export class NFTBurnedEvent extends BlockchainEvent {
    nftId: number;

    constructor(event: Event) {
        super(event, EventType.NFTBurned);

        this.nftId = Number.parseInt(event.data[0].toString());
    }
}

// TODO
export class NFTDelegatedEvent extends BlockchainEvent {
    nftId: number;
    recipient: string;

    constructor(event: Event) {
        super(event, EventType.NFTDelegated);

        this.nftId = Number.parseInt(event.data[0].toString());
        this.recipient = event.data[1].toString();
    }
}

// TODO
export class NFTRoyaltySetEvent extends BlockchainEvent {
    nftId: number;
    royalty: string;

    constructor(event: Event) {
        super(event, EventType.NFTRoyaltySet);

        this.nftId = Number.parseInt(event.data[0].toString());
        this.royalty = event.data[1].toString();
    }
}

// TODO
export class NFTTransferredEvent extends BlockchainEvent {
    nftId: number;
    sender: string;
    recipient: string;

    constructor(event: Event) {
        super(event, EventType.NFTTransferred);

        this.nftId = Number.parseInt(event.data[0].toString());
        this.sender = event.data[1].toString();
        this.recipient = event.data[2].toString();
    }
}

// TODO
export class NFTAddedToCollectionEvent extends BlockchainEvent {
    nftId: number;
    collectionId: number;

    constructor(event: Event) {
        super(event, EventType.NFTAddedToCollection);

        this.nftId = Number.parseInt(event.data[0].toString());
        this.collectionId = Number.parseInt(event.data[1].toString());
    }
}

// TODO
export class CollectionCreatedEvent extends BlockchainEvent {
    collectionId: number;
    owner: string;
    offchainData: string;
    limit: number;

    constructor(event: Event) {
        super(event, EventType.CollectionCreated);

        this.collectionId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
        this.limit = Number.parseInt(event.data[3].toString());

        let offchainData = event.data[2].toHuman();
        this.offchainData = offchainData ? offchainData.toString() : "";
    }
}

// TODO
export class CollectionLimitedEvent extends BlockchainEvent {
    collectionId: number;
    limit: number;

    constructor(event: Event) {
        super(event, EventType.CollectionLimited);

        this.collectionId = Number.parseInt(event.data[0].toString());
        this.limit = Number.parseInt(event.data[1].toString());
    }
}

// TODO
export class CollectionClosedEvent extends BlockchainEvent {
    collectionId: number;

    constructor(event: Event) {
        super(event, EventType.CollectionClosed);

        this.collectionId = Number.parseInt(event.data[0].toString());
    }
}

// TODO
export class CollectionBurnedEvent extends BlockchainEvent {
    collectionId: number;

    constructor(event: Event) {
        super(event, EventType.CollectionBurned);

        this.collectionId = Number.parseInt(event.data[0].toString());
    }
}

// TODO
export class MarketplaceCreatedEvent extends BlockchainEvent {
    marketplaceId: number;
    owner: string;
    kind: MarketplaceKind;

    constructor(event: Event) {
        super(event, EventType.MarketplaceCreated);

        this.marketplaceId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
        this.kind = event.data[2].toString() == "Public" ? MarketplaceKind.Public : MarketplaceKind.Private;
    }
}

// TODO
export class MarketplaceOwnerSetEvent extends BlockchainEvent {
    marketplaceId: number;
    owner: string;

    constructor(event: Event) {
        super(event, EventType.MarketplaceOwnerSet);

        this.marketplaceId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
    }
}

// TODO
export class MarketplaceKindSetEvent extends BlockchainEvent {
    marketplaceId: number;
    kind: MarketplaceKind;

    constructor(event: Event) {
        super(event, EventType.MarketplaceKindSet);

        this.marketplaceId = Number.parseInt(event.data[0].toString());
        this.kind = event.data[1].toString() == "Public" ? MarketplaceKind.Public : MarketplaceKind.Private;
    }
}

// TODO
export class MarketplaceConfigSetEvent extends BlockchainEvent {
    constructor(event: Event) {
        super(event, EventType.MarketplaceConfigSet);
    }
}

// TODO
export class MarketplaceMintFeeSetEvent extends BlockchainEvent {
    fee: string;

    constructor(event: Event) {
        super(event, EventType.MarketplaceMintFeeSet);

        this.fee = event.data[0].toString();
    }
}

// TODO
export class NFTListedEvent extends BlockchainEvent {
    nftId: number;
    marketplaceId: number;
    price: string;
    commissionFee?: string;

    constructor(event: Event) {
        super(event, EventType.NFTListed);

        this.nftId = Number.parseInt(event.data[0].toString());
        this.marketplaceId = Number.parseInt(event.data[1].toString());
        this.price = event.data[2].toString();
        this.commissionFee = event.data[3].isEmpty ? undefined : event.data[3].toString();
    }
}

// TODO
export class NFTUnlistedEvent extends BlockchainEvent {
    nftId: number;

    constructor(event: Event) {
        super(event, EventType.NFTUnlisted);

        this.nftId = Number.parseInt(event.data[0].toString());
    }
}

// TODO
export class NFTSoldEvent extends BlockchainEvent {
    nftId: number;
    marketplaceId: number;
    buyer: string;
    listedPrice: string;
    marketplaceCut: string;
    royaltyCut: string;


    constructor(event: Event) {
        super(event, EventType.NFTSold);

        this.nftId = Number.parseInt(event.data[0].toString());
        this.marketplaceId = Number.parseInt(event.data[1].toString());
        this.buyer = event.data[2].toString();
        this.listedPrice = event.data[3].toString();
        this.marketplaceCut = event.data[4].toString();
        this.royaltyCut = event.data[5].toString();
    }
}

// TODO
export class ItemCompletedEvent extends BlockchainEvent {
    constructor(event: Event) {
        super(event, EventType.ItemCompleted);
    }
}

// Here we need Index, Error, Type and Details. TODO
export class BatchInterruptedEvent extends BlockchainEvent {
    constructor(event: Event) {
        super(event, EventType.BatchInterrupted);
    }
}

// TODO
export class BatchCompletedEvent extends BlockchainEvent {
    constructor(event: Event) {
        super(event, EventType.BatchCompleted);
    }
}

// Here we need DispatchError, Type, Details and DispatchInfo TODO
export class ExtrinsicFailedEvent extends BlockchainEvent {
    constructor(event: Event) {
        super(event, EventType.ExtrinsicFailed);
    }
}

// Here we need DispatchInfo TODO
export class ExtrinsicSuccessEvent extends BlockchainEvent {
    constructor(event: Event) {
        super(event, EventType.ExtrinsicSuccess);
    }
}

// TODO
export class NewAccountEvent extends BlockchainEvent {
    account: string     // AccountId32

    constructor(event: Event) {
        super(event, EventType.NewAccount);

        this.account = event.data[0].toString();
    }
}

// TODO
export class UnknownEvent extends BlockchainEvent {
    constructor(event: Event) {
        super(event, EventType.Unknown);
    }
}

export class BlockchainEvents {
    inner: BlockchainEvent[]

    constructor(events: BlockchainEvent[]) {
        this.inner = events;
    }

    findEvents<T extends BlockchainEvent>(ctor: new (...args: any[]) => T): T[] {
        let events = this.inner.filter(event => event instanceof ctor);
        return events as T[];
    }

    findEvent<T extends BlockchainEvent>(ctor: new (...args: any[]) => T): T | undefined {
        let maybe_event = this.inner.find(event => event instanceof ctor);
        return maybe_event ? maybe_event as T : undefined;
    }

    findEventOrThrow<T extends BlockchainEvent>(ctor: new (...args: any[]) => T): T {
        let failed_event = this.inner.find(event => event.type == EventType.ExtrinsicFailed);
        let target_event = this.inner.find(event => event instanceof ctor);


        if (failed_event) {
            throw new Error("Nice Error");
        }

        if (target_event == undefined) {
            throw new Error("Nice Error");
        }

        return target_event as T;
    }
}