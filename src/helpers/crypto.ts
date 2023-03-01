import { IKeyringPair } from "@polkadot/types/types"
import { u8aToHex } from "@polkadot/util"
import { getRawApi } from "../blockchain"
import { Buffer } from "buffer"

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

/**
 * @name getLastBlock
 * @summary         Retrieve the last block number.
 * @returns         The last Block id (a number).
 */
export const getLastBlock = async () => {
  const api = getRawApi()
  const lastBlockDatas = await api.rpc.chain.getBlock()
  return Number(lastBlockDatas.block.header.number.toString())
}
