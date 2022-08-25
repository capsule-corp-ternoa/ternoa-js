import BN from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../../account"
import { balancesTransferTx } from "../../balance"
import { batchAllTxHex, initializeApi, submitTxBlocking } from "../../blockchain"
import { Errors, WaitUntil } from "../../constants"
import { PAIRSSR25519 } from "../testingPairs"

dotenv.config()

module.exports = async (): Promise<void> => {
  if (!process.env.SEED_TEST_FUNDS) throw new Error(Errors.SEED_NOT_FOUND)
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT

  await initializeApi(endpoint)
  const keyring = await getKeyringFromSeed(process.env.SEED_TEST_FUNDS)
  const pairs = PAIRSSR25519

  const amount = new BN("1000000000000000000000")
  const txs = await Promise.all(pairs.map((pair) => balancesTransferTx(pair.publicKey, amount)))
  const batchTx = await batchAllTxHex(txs)
  await submitTxBlocking(batchTx, WaitUntil.BlockInclusion, keyring)
}
