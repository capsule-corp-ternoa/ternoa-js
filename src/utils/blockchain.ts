import dotenv from "dotenv"
import { cryptoWaitReady } from "@polkadot/util-crypto"
import { ApiPromise, WsProvider } from "@polkadot/api"
import { decodeAddress, encodeAddress } from "@polkadot/keyring"
import { hexToU8a, isHex, BN_TEN } from "@polkadot/util"
import BN from "bn.js"
import { types } from "./types"

dotenv.config()

let api: ApiPromise

const CHAIN_ENDPOINT = "wss://testnet.ternoa.com"

const initializeApi = async () => {
  await cryptoWaitReady()
  const wsProvider = new WsProvider(CHAIN_ENDPOINT)
  api = await ApiPromise.create({
    provider: wsProvider,
    types,
  })
  return api
}

export const safeDisconnect = async () => {
  if (api && api.isConnected) await api.disconnect()
}

export const getApi = async () => {
  if (!api || !api.isConnected) api = await initializeApi()
  return api
}

export const isValidAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}

export const unFormatBalance = async (_input: number) => {
  const input = String(_input)
  const api = await getApi()
  const siPower = new BN(api.registry.chainDecimals[0])
  const basePower = api.registry.chainDecimals[0]
  const siUnitPower = 0
  const isDecimalValue = input.match(/^(\d+)\.(\d+)$/)
  let result

  if (isDecimalValue) {
    if (siUnitPower - isDecimalValue[2].length < -basePower) {
      result = new BN(-1)
    }
    const div = new BN(input.replace(/\.\d*$/, ""))
    const modString = input.replace(/^\d+\./, "").substring(0, api.registry.chainDecimals[0] + 1)
    const mod = new BN(modString)
    result = div.mul(BN_TEN.pow(siPower)).add(mod.mul(BN_TEN.pow(new BN(basePower + siUnitPower - modString.length))))
  } else {
    result = new BN(input.replace(/[^\d]/g, "")).mul(BN_TEN.pow(siPower))
  }
  return result
}
