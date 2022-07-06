import { BN } from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../../account"
import { balancesTransferAll, balancesTransferKeepAlive, getFreeBalance } from "../../balance"
import { initializeApi } from "../../blockchain"
import { Errors, WaitUntil } from "../../constants"
import { PAIRSSR25519 } from "../testingPairs"

dotenv.config()

const timer = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async (): Promise<void> => {
  if (!process.env.SEED_TEST_FUNDS) throw new Error(Errors.SEED_NOT_FOUND)
  await initializeApi()
  const keyring = await getKeyringFromSeed(process.env.SEED_TEST_FUNDS)
  const pairs = PAIRSSR25519
  //If some pairs contains caps, we send all to funds account
  for (const pair of pairs) {
    const pairFreeBalance = await getFreeBalance(pair.publicKey)
    if (pairFreeBalance.cmp(new BN("100000000000000000000")) === 1) {
      const pairKeyring = await getKeyringFromSeed(pair.seed)
      await balancesTransferAll(keyring.address, true, pairKeyring, WaitUntil.BlockInclusion)
    }
  }
  await timer(5000)
  //Then we send equal share to each test pair
  const freeBalance = await getFreeBalance(keyring.address)
  if (freeBalance.cmp(new BN("100000000000000000000")) === 1) {
    const share = freeBalance.sub(new BN("100000000000000000000")).div(new BN(pairs.length))
    for (const pair of pairs) {
      await balancesTransferKeepAlive(pair.publicKey, share, keyring, WaitUntil.BlockInclusion)
    }
  }
  await timer(5000)
}
