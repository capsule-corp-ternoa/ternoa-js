import '@polkadot/api-augment';
import { WaitUntil, EventType } from '../../src/constants';
import { getKeyringFromSeed } from '../../src/account/index';
import { submitTxBlocking, createCollection, createNftTx } from '../../src/nft/index';
import { signTx, batchAllTxHex } from '../../src/blockchain/index';


async function main() {
    // Create Collection :)
    // If needed, you can replace //TernoaTestAccount with your own account seed
    let keyring = await getKeyringFromSeed("//TernoaTestAccount");

    // In reality, this would be a link or a IPFS reference
    let collectionOffchainData = "Bored Dog Yacht Club (BDYC)";

    // This can be set to undefined if we want to have a open ended collection.
    let limit = 10;

    // In production code you would wait for the transaction to be inside a finalized block.
    let executionTrigger = WaitUntil.BlockInclusion;

    // This call can take up to 6 seconds to finish. The return value is the Collection Event or in case of an 
    // error an exception will be thrown.
    let collectionEvent = await createCollection(collectionOffchainData, limit, keyring, executionTrigger);

    // Printout collection
    console.log(collectionEvent);

    // Create Doggos :)
    // Define doggo names
    let dogNames = ["Charlie", "Bella", "Max", "Luna", "Buddy", "Coco", "Milo", "Ruby", "Archie", "Molly"];

    // We want to get a cut of every doggo sale :)
    let royalty = 10;

    // For each doggo we will create it's own transaction and sign it.
    let signableTxs = await Promise.all(dogNames.map(name => createNftTx(name, royalty, collectionEvent.collectionId, false)));
    let signedTxs = await Promise.all(signableTxs.map(tx => signTx(keyring, tx)));

    // Batching transactions allow us to execute just one transaction instead 10 of them separately. 
    let signableBatch = await batchAllTxHex(signedTxs);
    let signedBatch = await signTx(keyring, signableBatch);

    // This allows us to submit a transaction in a blocking way. The return value is a array of Events or in case of an 
    // error an exception will be thrown.
    let events = await submitTxBlocking(signedBatch, WaitUntil.BlockInclusion);

    // Now we just need to filter the right dog events and viola, our dogs are created :) 
    let dogs = events.filter(event => event.type == EventType.CreateNFT);
    dogs.forEach(dog => console.log(dog));

    process.exit();
}

main();

