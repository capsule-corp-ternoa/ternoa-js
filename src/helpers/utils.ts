import BN from "bn.js"
import { File } from "formdata-node"

import { balanceToNumber } from "../blockchain"
import { Errors } from "../constants"
import { SgxResDataType } from "./types"

/**
 * @name convertFileToBuffer
 * @summary                 Converts a File to Buffer.
 * @param file              File to convert.
 * @returns                 A Buffer.
 */
export const convertFileToBuffer = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return buffer
}

/**
 * @name formatPermill
 * @summary         Checks that percent is in range 0 to 100 and format to permill.
 * @param percent   Number in range from 0 to 100 with max 4 decimals.
 * @returns         The formated percent in permill format.
 */
export const formatPermill = (percent: number): number => {
  if (percent > 100 || percent < 0) {
    throw new Error(Errors.MUST_BE_PERCENTAGE)
  }

  return parseFloat(percent.toFixed(4)) * 10000
}

export const roundBalance = (amount: string) =>
  Number(balanceToNumber(new BN(amount), { forceUnit: "-", withUnit: false }).split(",").join(""))

export const removeURLSlash = (url: string) => {
  if (url.length === 0) return url
  const lastChar = url.charAt(url.length - 1)
  if (lastChar === "/") {
    return url.slice(0, -1)
  } else {
    return url
  }
}

export const retryPost = async <T>(fn: () => Promise<any>, n: number): Promise<T> => {
  let lastError: any

  for (let i = 0; i < n; i++) {
    try {
      console.log("RETRY:", i)
      return await fn()
    } catch (e) {
      lastError = {
        ...(e as Error),
      }
    }
  }

  return lastError
}
