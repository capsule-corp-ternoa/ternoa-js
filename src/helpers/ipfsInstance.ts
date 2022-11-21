import { AxiosInstance } from "axios"
import { createHttpInstance } from "./httpInstance"

const IPFS_TIMEOUT = 30000

export let ipfsApi: { [x: string]: AxiosInstance }

export const ipfsInstance = (baseURL: string, apiKey?: string) => {
  const timeout = IPFS_TIMEOUT
  const headers = {
    ...(apiKey && { apiKey }),
  }
  const instance: AxiosInstance = createHttpInstance(baseURL, timeout, headers)

  instance.interceptors.request.use(
    (config) => {
      console.log('interceptors request config', config)
      return config
    },
    (error) => {
      console.log('interceptors request error', error)
      return Promise.reject(error)
    },
  )

  instance.interceptors.response.use(
    (response) => {
      console.log('interceptors response response', response)
      return response
    },
    (error) => {
      console.log('interceptors response error', error)
      return Promise.reject(error)
    },
  )

  return instance
}

export const setIpfsApis = (config: { [x: string]: { baseURL: string; apiKey: string } }) => {
  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      const { baseURL, apiKey } = config[key]
      ipfsApi = {
        ...ipfsApi,
        [key]: ipfsInstance(baseURL, apiKey),
      }
    }
  }
}
