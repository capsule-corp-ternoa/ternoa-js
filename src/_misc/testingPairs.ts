import { cryptoWaitReady } from "@polkadot/util-crypto"
import { Keyring } from "@polkadot/keyring"
import { KeypairType } from "@polkadot/util-crypto/types"
import type { IKeyringPair } from "@polkadot/types/types"

interface PairDef {
  name: string
  publicKey: string
  seed: string
  type: KeypairType
}

export const TEST_DATA = {
  collectionId: 0,
  nftId: 0
}

export interface TestKeyringMap {
  [index: string]: IKeyringPair
}

export const PAIRSSR25519: PairDef[] = [
  {
    name: "test",
    publicKey: "5GesFQSwhmuMKAHcDrfm21Z5xrq6kW93C1ch2Xosq1rXx2Eh",
    seed: "soccer traffic version fault humor tackle bid tape obvious wild fish coin",
    type: "sr25519",
  },
  {
    name: "dest",
    publicKey: "5C5U1zoKAytwirg2XD2cUDXrAShyQ4dyx5QkPf7ChWQAykLR",
    seed: "sponsor music pony breeze recall engage sport jelly certain unit spoil shift",
    type: "sr25519",
  },
]

/**
 * @name testKeyring
 * @summary Create keyring pairs with locked test accounts
 */
export const createTestPairs = async (): Promise<TestKeyringMap> => {
  await cryptoWaitReady()
  const keyring = new Keyring()

  for (const { name, seed, type } of PAIRSSR25519) {
    keyring.addPair(
      keyring.createFromUri(
        seed,
        {
          isTesting: true,
          name,
        },
        type,
      ),
    )
  }

  const pairs = keyring.getPairs()
  const map: TestKeyringMap = {}

  for (const p of pairs) {
    map[p.meta.name as string] = p
  }

  return map
}
