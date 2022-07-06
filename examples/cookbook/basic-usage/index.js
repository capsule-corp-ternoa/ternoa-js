"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@polkadot/api-augment");
const constants_1 = require("../../../src/constants");
const events_1 = require("../../../src/events");
const index_1 = require("../../../src/account/index");
const index_2 = require("../../../src/nft/index");
const index_3 = require("../../../src/blockchain/index");
async function main() {
    // Create Collection :)
    // If needed, you can replace //TernoaTestAccount with your own account seed
    let keyring = await (0, index_1.getKeyringFromSeed)("//TernoaTestAccount");
    /*     let a = await createMarketplace(MarketplaceKind.Public, keyring, WaitUntil.BlockInclusion); */
    //let x = await setMarketplaceOwner(10, "5H6CufD1EAFqLv5idoecZDXuvjZXqmQ399n3SuGFS8R5sD22", keyring, WaitUntil.BlockInclusion);
    /*     let x = await setMarketplaceKind(a.marketplaceId, MarketplaceKind.Private, keyring, WaitUntil.BlockInclusion); */
    //console.log(x);
    // In reality, this would be a link or a IPFS reference
    let collectionOffchainData = "Bored Dog Yacht Club (BDYC)";
    // This can be set to undefined if we want to have a open ended collection.
    let limit = 10;
    // In production code you would wait for the transaction to be inside a finalized block.
    let executionTrigger = constants_1.WaitUntil.BlockInclusion;
    // This call can take up to 6 seconds to finish. The return value is the Collection Event or in case of an 
    // error an exception will be thrown.
    let collectionEvent = await (0, index_2.createCollection)(collectionOffchainData, limit, keyring, executionTrigger);
    // Printout collection
    console.log(collectionEvent);
    // Create Doggos :)
    // Define doggo names
    let dogNames = ["Charlie", "Bella", "Max", "Luna", "Buddy", "Coco", "Milo", "Ruby", "Archie", "Molly"];
    // We want to get a cut of every doggo sale :)
    let royalty = 10;
    // For each doggo we will create it's own transaction and sign it.
    let signableTxs = await Promise.all(dogNames.map(name => (0, index_2.createNftTx)(name, royalty, collectionEvent.collectionId, false)));
    // Batching transactions allow us to execute just one transaction instead 10 of them separately. 
    let signableBatch = await (0, index_3.batchAllTxHex)(signableTxs);
    // This allows us to submit a transaction in a blocking way. The return value is a array of Events or in case of an 
    // error an exception will be thrown.
    let events = await (0, index_3.submitTxBlocking)(signableBatch, constants_1.WaitUntil.BlockInclusion, keyring);
    // Now we just need to filter the right dog events and viola, our dogs are created :) 
    let dogs = events.findEvents(events_1.NFTCreatedEvent);
    dogs.forEach(dog => console.log(dog));
    process.exit();
}
main();
