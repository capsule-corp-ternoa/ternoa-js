import BN from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../../account"
import { balancesTransferTx } from "../../balance"
import { batchAllTxHex, initializeApi, submitTxBlocking } from "../../blockchain"
import { Errors, WaitUntil } from "../../constants"
import { createCollection, createNft } from "../../nft"
import { createTestPairs, PAIRSSR25519, TEST_DATA } from "../testingPairs"

dotenv.config()

module.exports = async (): Promise<void> => {
  if (!process.env.SEED_TEST_FUNDS) throw new Error(Errors.SEED_NOT_FOUND)
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT;

  await initializeApi(endpoint)
  const keyring = await getKeyringFromSeed(process.env.SEED_TEST_FUNDS)
  const pairs = PAIRSSR25519

  const amount = new BN("100000000000000000000");
  let txs = await Promise.all(pairs.map(pair => balancesTransferTx(pair.publicKey, amount)));
  let batchTx = await batchAllTxHex(txs);
  await submitTxBlocking(batchTx, WaitUntil.BlockInclusion, keyring);

  // Create some Test NFTs and Collections
  const { test: testAccount } = await createTestPairs();
  let cEvent = await createCollection("Collection Test", undefined, testAccount, WaitUntil.BlockInclusion);
  let nEvent = await createNft("Test NFT Data", 0, cEvent.collectionId, false, testAccount, WaitUntil.BlockInclusion);

  TEST_DATA.collectionId = cEvent.collectionId;
  TEST_DATA.nftId = nEvent.nftId;
}
