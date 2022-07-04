"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConVar = exports.sleep = exports.CreateNFTEvent = exports.CreateCollectionEvent = exports.BlockchainEvent = exports.EventType = exports.WaitUntil = exports.chainConstants = exports.chainQuery = exports.txEvent = exports.txActions = exports.txPallets = void 0;
var txPallets;
(function (txPallets) {
    txPallets["marketplace"] = "marketplace";
    txPallets["nft"] = "nft";
    txPallets["utility"] = "utility";
    txPallets["balances"] = "balances";
    txPallets["capsules"] = "capsules";
    txPallets["associatedAccounts"] = "associatedAccounts";
    txPallets["system"] = "system";
})(txPallets = exports.txPallets || (exports.txPallets = {}));
var txActions;
(function (txActions) {
    txActions["buy"] = "buy";
    txActions["list"] = "list";
    txActions["unlist"] = "unlist";
    txActions["burn"] = "burn";
    txActions["burnNft"] = "burnNft";
    txActions["transferNft"] = "transferNft";
    txActions["delegateNft"] = "delegateNft";
    txActions["setRoyalty"] = "setRoyalty";
    txActions["setNftMintFee"] = "setNftMintFee";
    txActions["addNftToCollection"] = "addNftToCollection";
    txActions["createCollection"] = "createCollection";
    txActions["limitCollection"] = "limitCollection";
    txActions["closeCollection"] = "closeCollection";
    txActions["burnCollection"] = "burnCollection";
    txActions["create"] = "create";
    txActions["createNft"] = "createNft";
    txActions["transfer"] = "transfer";
    txActions["transferAll"] = "transferAll";
    txActions["transferKeepAlive"] = "transferKeepAlive";
    txActions["finishSeries"] = "finishSeries";
    txActions["batch"] = "batch";
    txActions["batchAll"] = "batchAll";
    txActions["createFromNft"] = "createFromNft";
    txActions["remove"] = "remove";
    txActions["setIpfsReference"] = "setIpfsReference";
    txActions["setAltvrUsername"] = "setAltvrUsername";
    txActions["setCommissionFee"] = "setCommissionFee";
    txActions["setOwner"] = "setOwner";
    txActions["setKind"] = "setMarketType";
    txActions["setName"] = "setName";
    txActions["setUri"] = "setUri";
    txActions["setLogoUri"] = "setLogoUri";
})(txActions = exports.txActions || (exports.txActions = {}));
var txEvent;
(function (txEvent) {
    txEvent["nftsCreated"] = "Created";
    txEvent["nftsBurned"] = "Burned";
    txEvent["nftsTransfered"] = "Transfered";
    txEvent["CapsuleIpfsReferenceChanged"] = "CapsuleIpfsReferenceChanged";
    txEvent["CapsuleCreated"] = "CapsuleCreated";
    txEvent["CapsuleRemoved"] = "CapsuleRemoved";
    txEvent["MarketplaceCreated"] = "MarketplaceCreated";
    txEvent["ExtrinsicSuccess"] = "ExtrinsicSuccess";
    txEvent["ExtrinsicFailed"] = "ExtrinsicFailed";
    txEvent["BatchCompleted"] = "BatchCompleted";
    txEvent["BatchInterrupted"] = "BatchInterrupted";
})(txEvent = exports.txEvent || (exports.txEvent = {}));
var chainQuery;
(function (chainQuery) {
    chainQuery["nftMintFee"] = "nftMintFee";
    chainQuery["nfts"] = "nfts";
    chainQuery["nextNFTId"] = "nextNFTId";
    chainQuery["nextCollectionId"] = "nextCollectionId";
    chainQuery["collectionSizeLimit"] = "collectionSizeLimit";
    chainQuery["capsuleMintFee"] = "capsuleMintFee";
    chainQuery["marketplaceMintFee"] = "marketplaceMintFee";
    chainQuery["account"] = "account";
    chainQuery["number"] = "number";
    chainQuery["collections"] = "collections";
})(chainQuery = exports.chainQuery || (exports.chainQuery = {}));
var chainConstants;
(function (chainConstants) {
    chainConstants["existentialDeposit"] = "existentialDeposit";
    chainConstants["nftOffchainDataLimit"] = "nftOffchainDataLimit";
    chainConstants["collectionOffchainDataLimit"] = "collectionOffchainDataLimit";
})(chainConstants = exports.chainConstants || (exports.chainConstants = {}));
var WaitUntil;
(function (WaitUntil) {
    WaitUntil[WaitUntil["BlockInclusion"] = 0] = "BlockInclusion";
    WaitUntil[WaitUntil["BlockFinalization"] = 1] = "BlockFinalization";
})(WaitUntil = exports.WaitUntil || (exports.WaitUntil = {}));
var EventType;
(function (EventType) {
    EventType[EventType["CreateCollection"] = 0] = "CreateCollection";
    EventType[EventType["CreateNFT"] = 1] = "CreateNFT";
})(EventType = exports.EventType || (exports.EventType = {}));
class BlockchainEvent {
    constructor(type) {
        this.type = type;
    }
    static fromEvent(event) {
        if (event.method == "CollectionCreated") {
            return new CreateCollectionEvent(event);
        }
        else if (event.method == "NFTCreated") {
            return new CreateNFTEvent(event);
        }
        return null;
    }
}
exports.BlockchainEvent = BlockchainEvent;
class CreateCollectionEvent extends BlockchainEvent {
    constructor(event) {
        super(EventType.CreateCollection);
        this.collectionId = Number.parseInt(event.data[0].toString());
        this.owner = event.data[1].toString();
        this.limit = Number.parseInt(event.data[3].toString());
        let metadata = event.data[2].toHuman();
        this.metadata = metadata ? metadata.toString() : "";
    }
}
exports.CreateCollectionEvent = CreateCollectionEvent;
class CreateNFTEvent extends BlockchainEvent {
    constructor(event) {
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
exports.CreateNFTEvent = CreateNFTEvent;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
class ConVar {
    constructor(sleepInterval = 1000, maxWaitTime) {
        this.done = false;
        this.maxWaitTime = maxWaitTime;
        this.sleepInterval = sleepInterval;
    }
    notify() {
        this.done = true;
    }
    async wait() {
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
exports.ConVar = ConVar;
