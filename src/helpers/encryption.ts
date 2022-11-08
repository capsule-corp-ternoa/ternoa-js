import * as openpgp from "openpgp"
import mime from "mime-types"

import { ipfsFileUpload } from "./ipfs"
import { generatePGPKeysType } from "./types"

import { Errors } from "../constants"
import { INFTMetadata } from "../nft"

/**
 * @name generatePGPKeys
 * @summary             Generates a new OpenPGP key pair
 * @returns             An object with both private and public keys.
 */
export const generatePGPKeys = async (): Promise<generatePGPKeysType> => {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "ecc", // Type of the key, defaults to ECC
    curve: "curve25519", // ECC curve name, defaults to curve25519
    userIDs: [{ name: "Jon Smith", email: "jon@example.com" }], // you can pass multiple user IDs
    // revocationCertificate not needed ??
    // passphrase: "super long and hard to guess secret", // protects the private key
    // format: "armored", // output key format, defaults to 'armored' (other options: 'binary' or 'object')
  })
  return { privateKey, publicKey }
}

/**
 * @name encryptFile
 * @summary             Encrypts file with the public key.
 * @param file          File to encrypt.
 * @param publicPGPKey  Public Key to encrypt the file.
 * @see                 Learn more about encryption {@link https://docs.openpgpjs.org/global.html#encrypt here}.
 * @returns             A string containing the encrypted file.
 */
export const encryptFile = async (file: File, publicPGPKey: string) => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const content = buffer.toString("base64")
  const message = await openpgp.createMessage({
    text: content,
  })
  const publicKey = await openpgp.readKey({
    armoredKey: publicPGPKey,
  })
  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: [publicKey],
  })

  return encrypted as string // to String working ??
}

/**
 * @name encryptAndUploadFile
 * @summary             Encrypts and uploads a file on an IFPS gateway.
 * @param file          File to encrypt and then upload on IPFS.
 * @param ipfsGateway   IPFS gateway to upload your file on. Default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             An array containing both secretFile IPFS hash and publicPGPKey hash.
 */
export const encryptAndUploadFile = async (file: File, ipfsGateway?: string, apiKey?: string) => {
  // Generate private/public keys
  const pgpKeys = await generatePGPKeys()
  // Encrypt file with public key
  const encryptedFile = await encryptFile(file, pgpKeys.publicKey)
  // Get file type
  const fileType = mime.lookup(file.name) // as string ??
  // Create a new file from encrypted string
  const encryptedFileBlob = new Blob([encryptedFile], { type: fileType ? fileType : "text/plain" })
  const secretFile = new File([encryptedFileBlob], "encrypted nft")
  // Create a new file from public key
  const pgpBlob = new Blob([pgpKeys.publicKey], { type: "text/plain" })
  const pgpFile = new File([pgpBlob], "encrypted pgp")
  // Upload Secret and Pgp Public Key on IPFS to get hash
  const [{ hash: secretUploadHash }, { hash: pgpUploadHash }] = await Promise.all([
    ipfsFileUpload(secretFile, ipfsGateway, apiKey),
    ipfsFileUpload(pgpFile, ipfsGateway, apiKey),
  ])
  return [secretUploadHash, pgpUploadHash]
}

/**
 * @name secretNftIpfsUpload
 * @summary             Encrypts file and uploads secret metadatas containing encrypted file on IPFS.
 * @param data          Secret offchain metadatas to be uploaded. It must fit the INFTMetadata interface format with a description, file and title.
 * @param ipfsGateway   IPFS gateway to upload your secret metadatas on. If not provided, default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             The data object with the hash to add as offchain secret metadatas in the extrinsic.
 */
export const secretNftIpfsUpload = async (data: INFTMetadata, ipfsGateway?: string, apiKey?: string) => {
  const { description, file, title } = data
  if (!file) throw new Error(Errors.IPFS_FILE_UNDEFINED_ON_UPLOAD)
  const [{ hash: cryptedFileHash }, { hash: publicPGPKeyHash }] = await encryptAndUploadFile(file, ipfsGateway, apiKey)
  const secretMetaDatas = {
    title,
    description,
    properties: {
      encryptedMedia: {
        hash: cryptedFileHash,
        size: file.size,
        type: file.type,
      },
      publicKeyOfNft: publicPGPKeyHash,
    },
  }
  const finalBlob = new Blob([JSON.stringify(secretMetaDatas)], { type: "application/json" })
  const finalFile = new File([finalBlob], "secret nft metadatas")
  return await ipfsFileUpload(finalFile, ipfsGateway, apiKey)
}
