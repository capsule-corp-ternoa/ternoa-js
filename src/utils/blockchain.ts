import dotenv from "dotenv"
import axios from "axios"
import { cryptoWaitReady } from "@polkadot/util-crypto"
import { ApiPromise, WsProvider } from "@polkadot/api"
dotenv.config()

let api: ApiPromise

const CHAIN_ENDPOINT = process.env.CHAIN_ENDPOINT || "wss://testnet.ternoa.com"
const COMMON_API_URL = process.env.COMMON_API_URL || "https://ternoa-api.testnet.ternoa.com"
export const TEST_SEED = process.env.TEST_SEED

export const getChainSpec = async () => await axios.get(`${COMMON_API_URL}/api/chaintypes`)

const initializeApi = async () => {
  await cryptoWaitReady()
  const wsProvider = new WsProvider(CHAIN_ENDPOINT)
  const spec = await getChainSpec()
  const types = spec.data
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
