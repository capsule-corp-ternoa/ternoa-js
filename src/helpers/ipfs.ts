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
  CapsuleEncryptedMedia,
  CapsuleMedia,
  MediaMetadataType,
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
    form.append("file", file)
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
  static storeNFT = async (service: IServiceIPFS, file: File, metadata: NftMetadataType) => {
    validateNFTMetadata(metadata)
    const res = await TernoaIPFS.storeFile(service, file)
    if (!res) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload NFT's asset`)
    const { Hash: hash, Size: size } = res
    const nftMetadata = {
      ...metadata,
      image: hash,
      properties: {
        ...metadata.properties,
        media: {
          ...metadata.properties?.media,
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
   * Store a Ternoa secret NFT's metadata & asset on IPFS.
   *
   * @param service
   * @param encryptedFile     NFT's encrypted asset.
   * @param encryptedFileType The original encrypted file type.
   * @param publicKey         Public key used to encrypt the Secret NFT.
   * @param nftMetadata       (Optional) Secret NFT metadata {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-520-Secret-nft.md here}.
   * @param mediaMetadata     (Optional) Secret NFT asset metadata.
   * @returns                 IPFS secret NFT data (Hash, Size, Name).
   */
  static storeSecretNFT = async (
    service: IServiceIPFS,
    encryptedFile: string,
    encryptedFileType: string,
    publicKey: string,
    nftMetadata?: Partial<NftMetadataType>,
    mediaMetadata?: MediaMetadataType,
  ) => {
    if (nftMetadata) validateOptionalNFTMetadata(nftMetadata)
    if (typeof publicKey !== "string")
      throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Secret NFT's publicKey must be a string`)
    const publicKeyBlob = new Blob([publicKey], { type: "text/plain" })
    const publicKeyFile = new File([publicKeyBlob], "SecretNFT public key")
    const publicKeyRes = await TernoaIPFS.storeFile(service, publicKeyFile)
    if (!publicKeyRes) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload secret NFT's public key`)
    const nftPublicKeyHash = publicKeyRes.Hash

    const blob = new Blob([encryptedFile], { type: "text/plain" })
    const file = new File([blob], "SecretNFT metadata")
    const secretNFTRes = await TernoaIPFS.storeFile(service, file)
    if (!secretNFTRes) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload secret NFT's asset`)
    const { Hash: secretNFTHash, Size: secretNFTSize } = secretNFTRes

    const secretNFTMetadata = {
      ...(nftMetadata && nftMetadata),
      properties: {
        ...nftMetadata?.properties,
        encrypted_media: {
          ...(typeof nftMetadata?.properties?.encrypted_media === "object" && nftMetadata?.properties?.encrypted_media),
          hash: secretNFTHash,
          type: encryptedFileType ?? file.type,
          size: secretNFTSize,
          ...(mediaMetadata && mediaMetadata),
        },
        public_key_of_nft: nftPublicKeyHash,
      },
    }
    const secretNFTMetadataBlob = new Blob([JSON.stringify(secretNFTMetadata)], { type: "application/json" })
    const secretNFTMetadataFile = new File([secretNFTMetadataBlob], "secretNFT metadata")
    return await TernoaIPFS.storeFile(service, secretNFTMetadataFile)
  }

  /**
   * Store a Ternoa Capsule NFT's metadata & assets on IPFS.
   *
   * @param service
   * @param publicKey         Public key used to encrypt the Capsule NFT.
   * @param encryptedMedia    An array of NFT's encrypted asset.
   * @param nftMetadata       (Optional) Capsule NFT metadata {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-530-Capsule.md here}.
   * @returns                 IPFS Capsule data (Hash, Size, Name).
   */
  static storeCapsuleNFT = async (
    service: IServiceIPFS,
    publicKey: string,
    encryptedMedia: CapsuleMedia[],
    nftMetadata?: Partial<NftMetadataType>,
  ) => {
    if (nftMetadata) validateOptionalNFTMetadata(nftMetadata)

    if (typeof publicKey !== "string")
      throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Capsule NFT's publicKey must be a string`)
    const publicKeyBlob = new Blob([publicKey], { type: "text/plain" })
    const publicKeyFile = new File([publicKeyBlob], "SecretNFT public key")
    const publicKeyRes = await TernoaIPFS.storeFile(service, publicKeyFile)
    if (!publicKeyRes) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload secret NFT's public key`)
    const nftPublicKeyHash = publicKeyRes.Hash

    const capsuleMedia: CapsuleEncryptedMedia[] = []
    await Promise.all(
      encryptedMedia.map(async ({ encryptedFile, type, ...rest }) => {
        const blob = new Blob([encryptedFile], { type: "text/plain" })
        const file = new File([blob], "capsuleMediaNFT")
        const { Hash: mediaHash, Size: mediaSize } = await TernoaIPFS.storeFile(service, file)
        if (!mediaHash) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload capsule NFT's media`)

        const media = {
          hash: mediaHash,
          type: type,
          size: Number(mediaSize),
          ...rest,
        } as CapsuleEncryptedMedia

        capsuleMedia.push(media)
      }),
    )

    const capsuleMetadata = {
      ...(nftMetadata && nftMetadata),
      properties: {
        ...nftMetadata?.properties,
        encryptedMedia: capsuleMedia,
        publicKey: nftPublicKeyHash,
      },
    }
    const capsuleNFTMetadataBlob = new Blob([JSON.stringify(capsuleMetadata)], { type: "application/json" })
    const capsuleNFTMetadataFile = new File([capsuleNFTMetadataBlob], "capsuleNFT metadata")
    return await TernoaIPFS.storeFile(service, capsuleNFTMetadataFile)
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
  static storeCollection = async (
    service: IServiceIPFS,
    profileFile: File,
    bannerFile: File,
    metadata: CollectionMetadataType,
  ) => {
    validateCollectionMetadata(metadata)
    const profileRes = await TernoaIPFS.storeFile(service, profileFile)
    if (!profileRes) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload collection's profile asset`)
    const bannerRes = await TernoaIPFS.storeFile(service, bannerFile)
    if (!bannerRes) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - Unable to upload collection's banner asset`)
    const collectionMetadata = {
      ...metadata,
      profile_image: profileRes.Hash,
      banner_image: bannerRes.Hash,
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
  static storeMarketplace = async (service: IServiceIPFS, file: File, metadata: MarketplaceMetadataType) => {
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

  storeNFT(file: File, metadata: NftMetadataType) {
    return TernoaIPFS.storeNFT(this, file, metadata)
  }

  storeSecretNFT(
    encryptedFile: string,
    encryptedFileType: string,
    publicKey: string,
    nftMetadata?: Partial<NftMetadataType>,
    mediaMetadata?: MediaMetadataType,
  ) {
    return TernoaIPFS.storeSecretNFT(this, encryptedFile, encryptedFileType, publicKey, nftMetadata, mediaMetadata)
  }

  storeCapsuleNFT(publicKey: string, encryptedMedia: CapsuleMedia[], nftMetadata?: Partial<NftMetadataType>) {
    return TernoaIPFS.storeCapsuleNFT(this, publicKey, encryptedMedia, nftMetadata)
  }

  storeCollection(profileFile: File, bannerFile: File, metadata: CollectionMetadataType) {
    return TernoaIPFS.storeCollection(this, profileFile, bannerFile, metadata)
  }

  storeMarketplace(file: File, metadata: MarketplaceMetadataType) {
    return TernoaIPFS.storeMarketplace(this, file, metadata)
  }
}

export const validateNFTMetadata = ({ title, description }: NftMetadataType) => {
  if (!title) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's title is required`)
  else if (typeof title !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's title must be a string`)
  }

  if (!description) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's description is required`)
  else if (typeof description !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : NFT's description must be a string`)
  }
}

export const validateOptionalNFTMetadata = ({ title, description }: Partial<NftMetadataType>) => {
  if (title !== undefined && typeof title !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Secret NFT's title must be a string`)
  }
  if (description !== undefined && typeof description !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Secret NFT's description must be a string`)
  }
}

export const validateCollectionMetadata = ({ name, description }: CollectionMetadataType) => {
  if (!name) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's name is required`)
  else if (typeof name !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's name must be a string`)
  }

  if (!name) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's description is required`)
  else if (typeof description !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Collection's description must be a string`)
  }
}

export const validateMarketplaceMetadata = ({ name }: MarketplaceMetadataType) => {
  if (!name) throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Marketplace's name is required`)
  else if (typeof name !== "string") {
    throw new TypeError(`${Errors.IPFS_METADATA_VALIDATION_ERROR} : Marketplace's name must be a string`)
  }
}
