import axios, { AxiosInstance } from "axios"

export class HttpClient {
  client: AxiosInstance

  constructor(baseURL: string, timeout?: number) {
    this.client = axios.create({
      baseURL,
      ...(timeout && { timeout })
    })
  }

  get = async <T>(url: string, config = {}) => {
    const response = await this.client.get<T>(url, config).catch((err) => {
      throw new Error(err)
    })
    return response.data
  }

  getRaw = async <T>(url: string, config = {}) => {
    const response = await this.client.get<T>(url, config).catch((err) => {
      throw new Error(err)
    })
    const { data, status } = response
    return { ...data, status }
  }

  post = async <T>(url: string, data: any, config = {}) => {
    const response = await this.client.post<T>(url, data, config).catch((err) => {
      throw new Error(err)
    })
    return response.data
  }
}
