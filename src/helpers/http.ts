import axios, { AxiosInstance } from "axios"
import https from "https"

export class HttpClient {
  client: AxiosInstance

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
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
    console.log(response)
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
