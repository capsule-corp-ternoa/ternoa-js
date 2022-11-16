import * as openpgp from "openpgp"

import { generatePGPKeysType } from "./types"

/**
 * @name generatePGPKeys
 * @summary             Generates a new OpenPGP key pair
 * @returns             An object with both private and public keys.
 */
export const generatePGPKeys = async (): Promise<generatePGPKeysType> => {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "ecc",
    curve: "curve25519",
    userIDs: [{ name: "Jon Smith", email: "jon@example.com" }],
  })
  return { privateKey, publicKey }
}

/**
 * @name encryptFile
 * @summary               Encrypts file with the public key.
 * @param fileDataBuffer  File to encrypt.
 * @param publicPGPKey    Public Key to encrypt the file.
 * @see                   Learn more about encryption {@link https://docs.openpgpjs.org/global.html#encrypt here}.
 * @returns               A string containing the encrypted file.
 */
export const encryptFile = async (fileDataBuffer: Buffer, publicPGPKey: string) => {
  const content = fileDataBuffer.toString("base64")
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

  return encrypted
}

/**
 * @name encryptAndUploadFile
 * @summary             Encrypts and uploads a file on an IFPS gateway.
 * @param file          File to encrypt and then upload on IPFS.
 * @param ipfsGateway   IPFS gateway to upload your file on. Default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             An array containing both secretFile IPFS hash and publicPGPKey hash.
 */
export const encryptAndUploadFile = async (
  publicPGPKey: string,
  file: Buffer,
  ipfsGateway?: string,
  apiKey?: string,
) => {
  // const encryptedFile = await encryptFile(file, publicPGPKey)
  // const encryptedFileDataBuffer = Buffer.from(encryptedFile as string)
  // const publicPGPKeyBuffer = Buffer.from(publicPGPKey as string)
  // const [secretIpfsUploadRes, publicPGPKeyIpfsUploadRes] = await Promise.all([
  //   ipfsFileUpload(encryptedFileDataBuffer, ipfsGateway, apiKey),
  //   ipfsFileUpload(publicPGPKeyBuffer, ipfsGateway, apiKey),
  // ])
  // return [secretIpfsUploadRes, publicPGPKeyIpfsUploadRes]
}

/**
 * @name secretNftIpfsUpload
 * @summary             Encrypts file and uploads secret metadatas containing encrypted file on IPFS.
 * @param data          Secret offchain metadatas to be uploaded. It must fit the INFTMetadata interface format with a description, file and title.
 * @param ipfsGateway   IPFS gateway to upload your secret metadatas on. If not provided, default is https://ipfs.ternoa.dev/api/v0/add
 * @param apiKey        API Key to validate the upload on the IPFS gateway.
 * @returns             The data object with the hash to add as offchain secret metadatas in the extrinsic.
 */
// export const secretNftIpfsUpload = async (
//   publicPGPKey: string,
//   data: INFTSecretMetadata,
//   ipfsGateway?: string,
//   apiKey?: string,
// ) => {
//   const { description, fileDataBuffer, fileType: type, title } = data
//   if (!fileDataBuffer) throw new Error(Errors.IPFS_FILE_UNDEFINED_ON_UPLOAD)
//   const [{ hash: encryptedFileIpfsHash, size: encryptedFileSize }, { hash: publicPGPKeyIpfsHash }] =
//     await encryptAndUploadFile(publicPGPKey, fileDataBuffer, ipfsGateway, apiKey)
//   const secretMetaDatas = {
//     title,
//     description,
//     properties: {
//       encryptedMedia: {
//         hash: encryptedFileIpfsHash,
//         size: encryptedFileSize,
//         type,
//       },
//       publicKeyOfNft: publicPGPKeyIpfsHash,
//     },
//   }
//   const finalFile = Buffer.from(JSON.stringify(secretMetaDatas))
//   return await ipfsFileUpload(finalFile, ipfsGateway, apiKey)
// }
