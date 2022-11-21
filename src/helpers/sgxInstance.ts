import { AxiosInstance } from "axios"
import { createHttpInstance } from "./httpInstance"

const SGX_TIMEOUT = 30000
const SGX_RETRY = 3

let retry = 0;

export let sgxApi: { [x: string]: AxiosInstance }

export const sgxInstance = (baseURL: string) => {
  const timeout = SGX_TIMEOUT
  const headers = {
    "Content-Type": "application/json",
  }
  const instance: AxiosInstance = createHttpInstance(baseURL, timeout, headers)

  instance.interceptors.request.use(
    (config) => {
      console.log("interceptors request config", config)
      return config
    },
    (error) => {
      console.log("interceptors request error", error)
      return Promise.reject(error)
    },
  )

  instance.interceptors.response.use(
    (response) => {
      console.log("interceptors response response", response)
      return response
    },
    (error) => {
      console.log("interceptors response error", error)
      return Promise.reject(error)
    },
  )

  return instance
}

export const setSgxApis = (enclavesBaseUrls: string[]) => {
  enclavesBaseUrls.map((enclaveBaseUrl, id) => {
    sgxApi = {
      ...sgxApi,
      [id]: sgxInstance(enclaveBaseUrl),
    }
  })
}

