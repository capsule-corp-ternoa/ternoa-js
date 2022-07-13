import BN from "bn.js"
import dotenv from "dotenv"
import { getKeyringFromSeed } from "../../account"
import { getFreeBalance, balancesTransferAll, checkBalanceForTransfer } from "../../balance"
import { safeDisconnect } from "../../blockchain"
import { Errors, WaitUntil } from "../../constants"
import { PAIRSSR25519 } from "../testingPairs"
import { KeyringPair } from "@polkadot/keyring/types"

dotenv.config()

module.exports = async (): Promise<void> => {
  if (!process.env.SEED_TEST_FUNDS) throw new Error(Errors.SEED_NOT_FOUND)

  const dstKeyring = await getKeyringFromSeed(process.env.SEED_TEST_FUNDS);
  const pairs = PAIRSSR25519

  const zero = new BN("0");
  let keyrings = await Promise.all(pairs.map(pair => getKeyringFromSeed(pair.seed)));
  let balances = await Promise.all(pairs.map(pair => getFreeBalance(pair.publicKey)));
  let filtered_keyrings = keyrings.filter((_, i) => balances[i].gt(zero));
  await Promise.all(filtered_keyrings.map(keyring => balancesTransferAll(dstKeyring.address, false, keyring, WaitUntil.BlockInclusion)));

  await safeDisconnect()
}

