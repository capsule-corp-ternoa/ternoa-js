import type { Block } from "@polkadot/types/interfaces/runtime"

import { getRawApi } from "../blockchain"
import { Errors } from "../constants"

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ConditionalVariable {
  done: boolean
  maxWaitTime?: number // In Milliseconds
  sleepInterval: number // In Milliseconds

  constructor(sleepInterval = 500, maxWaitTime?: number) {
    this.done = false
    this.maxWaitTime = maxWaitTime
    this.sleepInterval = sleepInterval
  }

  notify() {
    this.done = true
  }

  async wait(): Promise<boolean> {
    let sum = 0
    while (this.done === false) {
      if (this.maxWaitTime && sum >= this.maxWaitTime) {
        return false
      }

      await sleep(this.sleepInterval)
      sum += this.sleepInterval
    }

    return true
  }

  isDone() {
    return this.done
  }

  clear() {
    this.done = false
  }
}

export class BlockInfo {
  block?: Block
  blockHash?: string

  constructor(block?: Block, blockHash?: string) {
    this.block = block
    this.blockHash = blockHash
  }
}

export const blockNumberToDate = async (blockNumber: number) => {
  if (blockNumber <= 0) throw new Error(Errors.VALUE_MUST_BE_GREATER_THAN_0)
  const api = getRawApi()
  const lastBlockDatas = await api.rpc.chain.getBlock()
  const lastBlockNumber = Number(lastBlockDatas.block.header.number.toString())
  if (blockNumber > lastBlockNumber) throw new Error(Errors.BLOCK_NOT_FOUND_ON_CHAIN)
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  const signedBlock = await api.rpc.chain.getBlock(blockHash)
  const timestampNow = signedBlock.block.extrinsics[0].method.args
  const formatedTimestamp = timestampNow.toString().slice(0, -3)
  const date = new Date(Number(formatedTimestamp) * 1000)
  return date
}
