import BN from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../../account"
import { getFreeBalance, balancesTransferAll } from "../../balance"
import { initializeApi, safeDisconnect } from "../../blockchain"
import { Errors, WaitUntil } from "../../constants"
import { PAIRSSR25519 } from "../testingPairs"

dotenv.config()

const timer = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async (): Promise<void> => {
  if (!process.env.SEED_TEST_FUNDS_PUBLIC) throw new Error(Errors.PUBLIC_SEED_ADDRESS_NOT_FOUND)
  await initializeApi()
  const pairs = PAIRSSR25519
  await timer(15000)
  //If some pairs contains caps, we send all to funds account
  for (const pair of pairs) {
    const keyring = await getKeyringFromSeed(pair.seed)
    const freeBalance = await getFreeBalance(keyring.address)
    if (freeBalance.cmp(new BN("100000000000000000000")) === 1) {
      await balancesTransferAll(process.env.SEED_TEST_FUNDS_PUBLIC, false, keyring, WaitUntil.BlockInclusion)
    }
  }
  await safeDisconnect()
}
