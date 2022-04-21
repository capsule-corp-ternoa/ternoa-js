import BN from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../../account"
import { getBalance, transferAll } from "../../balance"
import { safeDisconnect } from "../../blockchain"
import { PAIRSSR25519 } from "../testingPairs"

dotenv.config()

const timer = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async () => {
  if (!process.env.SEED_TEST_FUNDS_PUBLIC)
    throw new Error("Test can't finish without public seed address to send test funds")
  const pairs = PAIRSSR25519
  await timer(5000)
  //If some pairs contains caps, we send all to funds account
  for (const pair of pairs) {
    const keyring = await getKeyringFromSeed(pair.seed)
    const balance = await getBalance(keyring.address)
    if (balance.cmp(new BN("100000000000000000000")) === 1) {
      await transferAll(process.env.SEED_TEST_FUNDS_PUBLIC, false, keyring)
    }
  }
  await safeDisconnect()
}
