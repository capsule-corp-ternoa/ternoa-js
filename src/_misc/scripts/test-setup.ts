import { BN } from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../../account"
import { getBalance, transferKeepAlive } from "../../balance"
import { PAIRSSR25519 } from "../testingPairs"

dotenv.config()

module.exports = async () => {
  if (!process.env.SEED_TEST_FUNDS) throw new Error("Test can't process without seed to get test funds")
  const keyring = await getKeyringFromSeed(process.env.SEED_TEST_FUNDS)
  const balance = (await getBalance(keyring.address)).div(new BN(100)).mul(new BN(95))
  if (balance.cmp(new BN("1000000000000000000")) === 1) {
    const pairs = PAIRSSR25519
    const share = balance.div(new BN(pairs.length))
    for (const pair of pairs) {
      await transferKeepAlive(keyring, pair.publicKey, share)
    }
  }
}
