import BN from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../functions/account"
import { getBalance, transferAll } from "../functions/balance"
import { safeDisconnect } from "../functions/blockchain"
import { PAIRSSR25519 } from "../testingPairs"

dotenv.config()

module.exports = async () => {
  if (!process.env.SEED_TEST_FUNDS_PUBLIC)
    throw new Error("Test can't finish without public seed address to send test funds")
  const pairs = PAIRSSR25519
  for (const pair of pairs) {
    const keyring = await getKeyringFromSeed(pair.seed)
    const balance = (await getBalance(keyring.address)).div(new BN(100)).mul(new BN(95))
    if (balance.cmp(new BN("1000000000000000000")) === 1) {
      await transferAll(keyring, process.env.SEED_TEST_FUNDS_PUBLIC)
    }
  }
  await safeDisconnect()
}
