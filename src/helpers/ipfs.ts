import { Blob, File, FormData } from "formdata-node"
import { FormDataEncoder } from "form-data-encoder"
import { Readable } from "stream"

import { Errors } from "../constants"

import { HttpClient } from "./http"
import {
  IpfsAddDataResponseType,
  IServiceIPFS,
  CollectionMetadataType,
  NftMetadataType,
  MarketplaceMetadataType,
} from "./types"

/**
 * @implements {IServiceIPFS}
 */
export class TernoaIPFS {
  apiKey?: string
  apiUrl: URL

  constructor(apiUrl = new URL("https://ipfs.ternoa.dev"), apiKey?: string) {
    /**
     * Service API `URL`.
     * @readonly
     */
    this.apiUrl = apiUrl
    /**
     * Authorization token.
     *
     * @readonly
     */
    this.apiKey = apiKey
  }

  /**
   * Get file from IPFS.
   *
   * @param ternoaIpfsService
   * @param hash
   * @returns IPFS file
   */
  static get = async ({ apiUrl }: IServiceIPFS, hash: string) => {
    const httpClient = new HttpClient(apiUrl.toString())
    const endpoint = `/ipfs/${hash}`
    return httpClient.get(endpoint)
  }

  /**
   * Upload file form data to IPFS.
   *
   * @param service
   * @param form
   * @returns IPFS data (hash, size, name)
   */
  static upload = async ({ apiKey, apiUrl }: IServiceIPFS, form: FormData) => {
    const httpClient = new HttpClient(apiUrl.toString())
    const endpoint = "/api/v0/add"
    let headers = { ...(apiKey && { apiKey }) }
    let data: FormData | Readable = form
    if (
      typeof process === "object" &&
      typeof process.versions === "object" &&
      typeof process.versions.node !== "undefined"
    ) {
      const encoder = new FormDataEncoder(form)
      headers = { ...headers, ...encoder.headers }
      data = Readable.from(encoder)
    }
    return httpClient.post<IpfsAddDataResponseType>(endpoint, data, {
      maxContentLength: 100000000, // 100mb
      maxBodyLength: 1000000000, // 100mb
      headers,
    })
  }

  /**
   * Store a single file on IPFS.
   *
   * @param service
   * @param file
   * @returns IPFS data (hash, size, name)
   */
  static storeFile = async (service: IServiceIPFS, file: File) => {
    const form = new FormData()
    form.set("file", file)
    return await TernoaIPFS.upload(service, form)
  }

  /**
   * Store a Ternoa basic NFT's metadata & asset on IPFS.
   *
   * @param service
   * @param file      NFT's asset
   * @param metadata  Ternoa basic NFT metadata structure {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-100-Basic-NFT.md#metadata here}.
   * @returns         IPFS data (Hash, Size, Name)
   */
  static storeNFT = async <T>(service: IServiceIPFS, file: File, metadata: NftMetadataType<T>) => {
    validateNFTMetadata(metadata)
    const res = await TernoaIPFS.storeFile(service, file)
    if (!res) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload NFT's asset`)
    const { Hash: hash, Size: size } = res
    const nftMetadata = {
      ...metadata,
      image: hash,
      properties: {
        media: {
          hash,
          size,
          type: file.type,
          name: file.name,
        },
      },
    }
    const metadataBlob = new Blob([JSON.stringify(nftMetadata)], { type: "application/json" })
    const metadataFile = new File([metadataBlob], "NFT metadata")
    return await TernoaIPFS.storeFile(service, metadataFile)
  }

  /**
   * Store a single Ternoa Collection's metadata & assets on IPFS.
   *
   * @param service
   * @param profileFile   Collection's profile asset
   * @param bannerFile    Collection's banner asset
   * @param metadata      Ternoa Collection metadata structure {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-101-Collection.md#metadata here}.
   * @returns             IPFS data (Hash, Size, Name)
   */
  static storeCollection = async <T>(
    service: IServiceIPFS,
    profileFile: File,
    bannerFile: File,
    metadata: CollectionMetadataType<T>,
  ) => {
    validateCollectionMetadata(metadata)
    const profileRes = await TernoaIPFS.storeFile(service, profileFile)
    if (!profileRes) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload collection's profile asset`)
    const bannerRes = await TernoaIPFS.storeFile(service, bannerFile)
    if (!bannerRes) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload collection's banner asset`)
    const collectionMetadata = {
      ...metadata,
      profileImage: profileRes.Hash,
      bannerImage: bannerRes.Hash,
    }
    const metadataBlob = new Blob([JSON.stringify(collectionMetadata)], { type: "application/json" })
    const metadataFile = new File([metadataBlob], "Collection metadata")
    return await TernoaIPFS.storeFile(service, metadataFile)
  }

  /**
   * Store a single Ternoa Marketplace's metadata & asset on IPFS.
   *
   * @param service
   * @param file      Marketplace's logo asset
   * @param metadata  Ternoa Marketplace metadata structure {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-200-Marketplace.md#metadata here}.
   * @returns         IPFS data (Hash, Size, Name)
   */
  static storeMarketplace = async <T>(service: IServiceIPFS, file: File, metadata: MarketplaceMetadataType<T>) => {
    validateMarketplaceMetadata(metadata)
    const res = await TernoaIPFS.storeFile(service, file)
    if (!res) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload marketplace's logo asset`)
    const collectionMetadata = {
      ...metadata,
      logo: res.Hash,
    }
    const metadataBlob = new Blob([JSON.stringify(collectionMetadata)], { type: "application/json" })
    const metadataFile = new File([metadataBlob], "Collection metadata")
    return await TernoaIPFS.storeFile(service, metadataFile)
  }

  getFile(hash: string) {
    return TernoaIPFS.get(this, hash)
  }

  storeFile(file: File) {
    return TernoaIPFS.storeFile(this, file)
  }

  storeNFT<T>(file: File, metadata: NftMetadataType<T>) {
    return TernoaIPFS.storeNFT(this, file, metadata)
  }

  storeCollection<T>(profileFile: File, bannerFile: File, metadata: CollectionMetadataType<T>) {
    return TernoaIPFS.storeCollection(this, profileFile, bannerFile, metadata)
  }

  storeMarketplace<T>(file: File, metadata: MarketplaceMetadataType<T>) {
    return TernoaIPFS.storeMarketplace(this, file, metadata)
  }
}

export const validateNFTMetadata = <T>({ title, description }: NftMetadataType<T>) => {
  if (!title) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's title is required`)
  else if (typeof title !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's title must be a string`)
  }

  if (!description) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's description is required`)
  else if (typeof description !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's description must be a string`)
  }
}

export const validateCollectionMetadata = <T>({ name, description }: CollectionMetadataType<T>) => {
  if (!name) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's name is required`)
  else if (typeof name !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's name must be a string`)
  }

  if (!name) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's description is required`)
  else if (typeof description !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's description must be a string`)
  }
}

export const validateMarketplaceMetadata = <T>({ name }: MarketplaceMetadataType<T>) => {
  if (!name) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Marketplace's name is required`)
  else if (typeof name !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Marketplace's name must be a string`)
  }
}
