"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainEvents = exports.UnknownEvent = exports.NewAccountEvent = exports.ExtrinsicSuccessEvent = exports.ExtrinsicFailedEvent = exports.BatchCompletedEvent = exports.BatchInterruptedEvent = exports.ItemCompletedEvent = exports.NFTSoldEvent = exports.NFTUnlistedEvent = exports.NFTListedEvent = exports.MarketplaceMintFeeSetEvent = exports.MarketplaceConfigSetEvent = exports.MarketplaceKindSetEvent = exports.MarketplaceOwnerSetEvent = exports.MarketplaceCreatedEvent = exports.CollectionBurnedEvent = exports.CollectionClosedEvent = exports.CollectionLimitedEvent = exports.CollectionCreatedEvent = exports.NFTAddedToCollectionEvent = exports.NFTTransferredEvent = exports.NFTRoyaltySetEvent = exports.NFTDelegatedEvent = exports.NFTBurnedEvent = exports.NFTCreatedEvent = exports.TreasuryDepositEvent = exports.BalancesEndowedEvent = exports.BalancesTransferEvent = exports.BalancesDepositEvent = exports.BalancesWithdrawEvent = exports.BlockchainEvent = exports.EventType = void 0;
const constants_1 = require("./constants");
var EventType;
(function (EventType) {
    // Balances
    EventType["BalancesWithdraw"] = "balances.Withdraw";
    EventType["BalancesDeposit"] = "balances.Deposit";
    EventType["BalancesTransfer"] = "balances.Transfer";
    EventType["BalancesEndowed"] = "balances.Endowed";
    // Treasury
    EventType["TreasuryDeposit"] = "treasury.Deposit";
    // NFT
    EventType["NFTCreated"] = "nft.NFTCreated";
    EventType["NFTBurned"] = "nft.NFTBurned";
    EventType["NFTDelegated"] = "nft.NFTDelegated";
    EventType["NFTRoyaltySet"] = "nft.NFTRoyaltySet";
    EventType["NFTTransferred"] = "nft.NFTTransferred";
    EventType["NFTAddedToCollection"] = "nft.NFTAddedToCollection";
    // NFT Collections
    EventType["CollectionCreated"] = "nft.CollectionCreated";
    EventType["CollectionLimited"] = "nft.CollectionLimited";
    EventType["CollectionClosed"] = "nft.CollectionClosed";
    EventType["CollectionBurned"] = "nft.CollectionBurned";
    // Marketplace
    EventType["MarketplaceCreated"] = "marketplace.MarketplaceCreated";
    EventType["MarketplaceOwnerSet"] = "marketplace.MarketplaceOwnerSet";
    EventType["MarketplaceKindSet"] = "marketplace.MarketplaceKindSet";
    EventType["MarketplaceConfigSet"] = "marketplace.MarketplaceConfigSet";
    EventType["MarketplaceMintFeeSet"] = "marketplace.MarketplaceMintFeeSet";
    EventType["NFTListed"] = "marketplace.NFTListed";
    EventType["NFTUnlisted"] = "marketplace.NFTUnlisted";
    EventType["NFTSold"] = "marketplace.NFTSold";
    // Utility
    EventType["ItemCompleted"] = "utility.ItemCompleted";
    EventType["BatchInterrupted"] = "utility.BatchInterrupted";
    EventType["BatchCompleted"] = "utility.BatchCompleted";
    // System
    EventType["ExtrinsicFailed"] = "system.ExtrinsicFailed";
    EventType["ExtrinsicSuccess"] = "system.ExtrinsicSuccess";
    EventType["NewAccount"] = "system.NewAccount";
    // Unknown
    EventType["Unknown"] = "Unknown";
})(EventType = exports.EventType || (exports.EventType = {}));
class BlockchainEvent {
    constructor(raw, type) {
        this.raw = raw;
        this.type = type;
        this.section = raw.section;
        this.method = raw.method;
    }
    static fromEvent(event) {
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
        }
        ;
        return new UnknownEvent(event);
    }
}
exports.BlockchainEvent = BlockchainEvent;
// TODO
class BalancesWithdrawEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.BalancesWithdraw);
        this.who = event.data[0].toString();
        this.amount = event.data[1].toString();
    }
}
exports.BalancesWithdrawEvent = BalancesWithdrawEvent;
// TODO
class BalancesDepositEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.BalancesDeposit);
        this.who = event.data[0].toString();
        this.amount = event.data[1].toString();
    }
}
exports.BalancesDepositEvent = BalancesDepositEvent;
// TODO
class BalancesTransferEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.BalancesTransfer);
        this.from = event.data[0].toString();
        this.to = event.data[1].toString();
        this.amount = event.data[2].toString();
    }
}
exports.BalancesTransferEvent = BalancesTransferEvent;
// TODO
class BalancesEndowedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.BalancesEndowed);
        this.account = event.data[0].toString();
        this.freeBalance = event.data[1].toString();
    }
}
exports.BalancesEndowedEvent = BalancesEndowedEvent;
// TODO
class TreasuryDepositEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.TreasuryDeposit);
        this.value = event.data[0].toString();
    }
}
exports.TreasuryDepositEvent = TreasuryDepositEvent;
// TODO
class NFTCreatedEvent extends BlockchainEvent {
    constructor(event) {
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
exports.NFTCreatedEvent = NFTCreatedEvent;
// TODO
class NFTBurnedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTBurned);
        this.nftId = Number.parseInt(event.data[0].toString());
    }
}
exports.NFTBurnedEvent = NFTBurnedEvent;
// TODO
class NFTDelegatedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTDelegated);
        this.nftId = Number.parseInt(event.data[0].toString());
        this.recipient = event.data[1].toString();
    }
}
exports.NFTDelegatedEvent = NFTDelegatedEvent;
// TODO
class NFTRoyaltySetEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTRoyaltySet);
        this.nftId = Number.parseInt(event.data[0].toString());
        this.royalty = event.data[1].toString();
    }
}
exports.NFTRoyaltySetEvent = NFTRoyaltySetEvent;
// TODO
class NFTTransferredEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTTransferred);
        this.nftId = Number.parseInt(event.data[0].toString());
        this.sender = event.data[1].toString();
        this.recipient = event.data[2].toString();
    }
}
exports.NFTTransferredEvent = NFTTransferredEvent;
// TODO
class NFTAddedToCollectionEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTAddedToCollection);
        this.nftId = Number.parseInt(event.data[0].toString());
        this.collectionId = Number.parseInt(event.data[1].toString());
    }
}
exports.NFTAddedToCollectionEvent = NFTAddedToCollectionEvent;
// TODO
class CollectionCreatedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.CollectionCreated);
        this.collectionId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
        this.limit = Number.parseInt(event.data[3].toString());
        let offchainData = event.data[2].toHuman();
        this.offchainData = offchainData ? offchainData.toString() : "";
    }
}
exports.CollectionCreatedEvent = CollectionCreatedEvent;
// TODO
class CollectionLimitedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.CollectionLimited);
        this.collectionId = Number.parseInt(event.data[0].toString());
        this.limit = Number.parseInt(event.data[1].toString());
    }
}
exports.CollectionLimitedEvent = CollectionLimitedEvent;
// TODO
class CollectionClosedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.CollectionClosed);
        this.collectionId = Number.parseInt(event.data[0].toString());
    }
}
exports.CollectionClosedEvent = CollectionClosedEvent;
// TODO
class CollectionBurnedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.CollectionBurned);
        this.collectionId = Number.parseInt(event.data[0].toString());
    }
}
exports.CollectionBurnedEvent = CollectionBurnedEvent;
// TODO
class MarketplaceCreatedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.MarketplaceCreated);
        this.marketplaceId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
        this.kind = event.data[2].toString() == "Public" ? constants_1.MarketplaceKind.Public : constants_1.MarketplaceKind.Private;
    }
}
exports.MarketplaceCreatedEvent = MarketplaceCreatedEvent;
// TODO
class MarketplaceOwnerSetEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.MarketplaceOwnerSet);
        this.marketplaceId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
    }
}
exports.MarketplaceOwnerSetEvent = MarketplaceOwnerSetEvent;
// TODO
class MarketplaceKindSetEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.MarketplaceKindSet);
        this.marketplaceId = Number.parseInt(event.data[0].toString());
        this.kind = event.data[1].toString() == "Public" ? constants_1.MarketplaceKind.Public : constants_1.MarketplaceKind.Private;
    }
}
exports.MarketplaceKindSetEvent = MarketplaceKindSetEvent;
// TODO
class MarketplaceConfigSetEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.MarketplaceConfigSet);
    }
}
exports.MarketplaceConfigSetEvent = MarketplaceConfigSetEvent;
// TODO
class MarketplaceMintFeeSetEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.MarketplaceMintFeeSet);
        this.fee = event.data[0].toString();
    }
}
exports.MarketplaceMintFeeSetEvent = MarketplaceMintFeeSetEvent;
// TODO
class NFTListedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTListed);
        this.nftId = Number.parseInt(event.data[0].toString());
        this.marketplaceId = Number.parseInt(event.data[1].toString());
        this.price = event.data[2].toString();
        this.commissionFee = event.data[3].isEmpty ? undefined : event.data[3].toString();
    }
}
exports.NFTListedEvent = NFTListedEvent;
// TODO
class NFTUnlistedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTUnlisted);
        this.nftId = Number.parseInt(event.data[0].toString());
    }
}
exports.NFTUnlistedEvent = NFTUnlistedEvent;
// TODO
class NFTSoldEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NFTSold);
        this.nftId = Number.parseInt(event.data[0].toString());
        this.marketplaceId = Number.parseInt(event.data[1].toString());
        this.buyer = event.data[2].toString();
        this.listedPrice = event.data[3].toString();
        this.marketplaceCut = event.data[4].toString();
        this.royaltyCut = event.data[5].toString();
    }
}
exports.NFTSoldEvent = NFTSoldEvent;
// TODO
class ItemCompletedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.ItemCompleted);
    }
}
exports.ItemCompletedEvent = ItemCompletedEvent;
// Here we need Index, Error, Type and Details. TODO
class BatchInterruptedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.BatchInterrupted);
    }
}
exports.BatchInterruptedEvent = BatchInterruptedEvent;
// TODO
class BatchCompletedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.BatchCompleted);
    }
}
exports.BatchCompletedEvent = BatchCompletedEvent;
// Here we need DispatchError, Type, Details and DispatchInfo TODO
class ExtrinsicFailedEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.ExtrinsicFailed);
    }
}
exports.ExtrinsicFailedEvent = ExtrinsicFailedEvent;
// Here we need DispatchInfo TODO
class ExtrinsicSuccessEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.ExtrinsicSuccess);
    }
}
exports.ExtrinsicSuccessEvent = ExtrinsicSuccessEvent;
// TODO
class NewAccountEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.NewAccount);
        this.account = event.data[0].toString();
    }
}
exports.NewAccountEvent = NewAccountEvent;
// TODO
class UnknownEvent extends BlockchainEvent {
    constructor(event) {
        super(event, EventType.Unknown);
    }
}
exports.UnknownEvent = UnknownEvent;
class BlockchainEvents {
    constructor(events) {
        this.inner = events;
    }
    findEvents(ctor) {
        let events = this.inner.filter(event => event instanceof ctor);
        return events;
    }
    findEvent(ctor) {
        let maybe_event = this.inner.find(event => event instanceof ctor);
        return maybe_event ? maybe_event : undefined;
    }
    findEventOrThrow(ctor) {
        let failed_event = this.inner.find(event => event.type == EventType.ExtrinsicFailed);
        let target_event = this.inner.find(event => event instanceof ctor);
        if (failed_event) {
            throw new Error("Nice Error");
        }
        if (target_event == undefined) {
            throw new Error("Nice Error");
        }
        return target_event;
    }
}
exports.BlockchainEvents = BlockchainEvents;
