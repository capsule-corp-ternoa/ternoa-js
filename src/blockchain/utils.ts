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

export const blockNumberToDate = async (blockNumber: number) => {
  if (blockNumber <= 0) throw new Error(Errors.VALUE_LOWER_THAN_0)
  const api = getRawApi()
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  const signedBlock = await api.rpc.chain.getBlock(blockHash)
  const timestampNow = signedBlock.block.extrinsics[0].method.args
  const formatedTimestamp = timestampNow.toString().slice(0, -3)
  const date = new Date(Number(formatedTimestamp) * 1000).toLocaleString() // toLocaleString ou pas ?
  return date
}

export const dateToBlockNumber = async (date: Date) => {
  // date : toLocaleString ou pas ?
  const today = new Date() // toLocaleString ou pas ?
  const duration = date.getTime() - today.getTime()
  const numberOfBlocks = await msDurationToBlockNumber(duration)
  const api = getRawApi()
  const lastBlockDatas = await api.rpc.chain.getBlock()
  const lastBlockNumber = Number(lastBlockDatas.block.header.number.toString())
  const blockNumber = Math.ceil(numberOfBlocks + lastBlockNumber) // math ceil ou pas ?
  return blockNumber
}

export const blockNumberToMsDuration = async (blockNumber: number, duration: number | undefined = 6) => {
  const msDuration = blockNumber * duration * 1000
  return msDuration
}

export const msDurationToBlockNumber = async (msDuration: number, duration: number | undefined = 6) => {
  const blockNumber = msDuration / duration / 1000
  return blockNumber
}
