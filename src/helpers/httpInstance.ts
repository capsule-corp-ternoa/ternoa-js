import axios, { AxiosInstance, RawAxiosRequestHeaders } from "axios"

export const createHttpInstance = (
  baseURL: string,
  timeout: number = 10000,
  headers: RawAxiosRequestHeaders,
): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout,
    headers,
  })
}
