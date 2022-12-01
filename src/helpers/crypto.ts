import { IKeyringPair } from "@polkadot/types/types"
import { u8aToHex } from "@polkadot/util"

/**
 * @name getSignature
 * @summary         Signs data using the keyring.
 * @param keyring   Account that will sign the data.
 * @param data      Data to be signed.
 * @returns         Hex value of the signed data.
 */
export const getSignature = (keyring: IKeyringPair, data: string) => {
  const finalData = new Uint8Array(Buffer.from(data))
  return u8aToHex(keyring.sign(finalData))
}
