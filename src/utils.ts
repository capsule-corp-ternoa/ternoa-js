import BN from "bn.js"
import { Errors } from "./constants"

import { balanceToNumber, getRawApi } from "./blockchain"

export const roundBalance = (amount: string) =>
  Number(balanceToNumber(new BN(amount), { forceUnit: "-", withUnit: false }).split(",").join(""))

export const blockNumberToDate = async (blockNumber: number) => {
  if (blockNumber <= 0) throw new Error(Errors.VALUE_LOWER_THAN_0)
  const api = getRawApi()
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  const signedBlock = await api.rpc.chain.getBlock(blockHash)
  const timestampNow = signedBlock.block.extrinsics[0].method.args
  const formatedTimestamp = timestampNow.toString().slice(0, -3)
  const date = new Date(Number(formatedTimestamp) * 1000).toLocaleString()
  return date
}
