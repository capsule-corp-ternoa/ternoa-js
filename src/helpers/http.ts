import axios, { AxiosInstance } from "axios"

export class HttpClient {
  client: AxiosInstance

  constructor(baseURL: string, timeout?: number) {
    this.client = axios.create({
      baseURL,
      ...(timeout && { timeout }),
    })
  }

  get = async <T>(url: string, config = {}) => {
    const response = await this.client.get<T>(url, config).catch((err) => {
      if (err.response) throw { status: err.response.status, data: err.response.data }
      throw { status: 500, data: "ECONNREFUSED", error: err }
      // throw new Error('url:' + url + ' Error:' + err)
    })
    return response.data
  }

  getRaw = async <T>(url: string, config = {}) => {
    const response = await this.client.get<T>(url, config).catch((err) => {
      if (err.response) throw { status: err.response.status, data: err.response.data }
      throw { status: 500, data: "ECONNREFUSED", error: err }
      // throw new Error('url:' + this.client.getUri() + url + ' ' + err)
    })
    const { data, status } = response
    return { ...data, status }
  }

  post = async <T>(url: string, data: any, config = {}) => {
    const response = await this.client.post<T>(url, data, config).catch((err) => {
      if (err.response) throw { status: err.response.status, data: err.response.data }
      throw { status: 500, data: "ECONNREFUSED", error: err }
      // throw new Error('url:' + url + ' Error:' + err)
    })
    return response.data
  }
}
