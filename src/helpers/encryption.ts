import * as openpgp from "openpgp"
import { File } from "formdata-node"
import { IKeyringPair } from "@polkadot/types/types"

import { NftMetadataType, PGPKeysType, SecretNftMetadataType } from "./types"
import { convertFileToBuffer } from "./utils"
import { TernoaIPFS } from "./ipfs"
import { formatPayload, generateSSSShares, getEnclaveHealthStatus, sgxSSSSharesUpload } from "./sgx"
import { Errors, WaitUntil } from "../constants"
import { createSecretNft } from "../nft"

/**
 * @name generatePGPKeys
 * @summary                 Generates a new PGP key pair.
 * @returns                 An object with both private and public PGP keys.
 */
export const generatePGPKeys = async (): Promise<PGPKeysType> => {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "ecc",
    curve: "curve25519",
    userIDs: [{ name: "Jon Smith", email: "jon@example.com" }],
  })

  return { privateKey, publicKey }
}

/**
 * @name encryptContent
 * @summary                 Encrypts a content (string).
 * @param content           Content to encrypt.
 * @param publicPGPKey      Public Key to encrypt the content.
 * @see                     Learn more about encryption {@link https://docs.openpgpjs.org/global.html#encrypt here}.
 * @returns                 A string containing the encrypted content.
 */
export const encryptContent = async (content: string, publicPGPKey: string) => {
  const message = await openpgp.createMessage({
    text: content,
  })
  const publicKey = await openpgp.readKey({
    armoredKey: publicPGPKey,
  })
  const encryptedContent = await openpgp.encrypt({
    message,
    encryptionKeys: [publicKey],
  })

  return encryptedContent
}

/**
 * @name encryptFile
 * @summary                 Encrypts file with the public key.
 * @param file              File to encrypt.
 * @param publicPGPKey      Public Key to encrypt the file.
 * @see                     Learn more about encryption {@link https://docs.openpgpjs.org/global.html#encrypt here}.
 * @returns                 A string containing the encrypted file.
 */
export const encryptFile = async (file: File, publicPGPKey: string) => {
  const buffer = await convertFileToBuffer(file)
  const content = buffer.toString("base64")
  const encryptedFile = await encryptContent(content, publicPGPKey)

  return encryptedFile
}

/**
 * @name decryptFile
 * @summary                 Decrypts message with the private key.
 * @param encryptedMessage  Message to decrypt.
 * @param privatePGPKey     Private Key to decrypt the message.
 * @see                     Learn more about encryption {@link https://docs.openpgpjs.org/global.html#decrypt here}.
 * @returns                 A base64 string containing the decrypted message.
 */
export const decryptFile = async (encryptedMessage: string, privatePGPKey: string) => {
  const privateKey = await openpgp.readPrivateKey({ armoredKey: privatePGPKey })
  const message = await openpgp.readMessage({
    armoredMessage: encryptedMessage,
  })
  const { data: decryptedMessage } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
  })

  return decryptedMessage
}

/**
 * @name secretNftEncryptAndUploadFile
 * @summary                 Encrypts and uploads a file on an IFPS gateway.
 * @param file              File to encrypt and then upload on IPFS.
 * @param publicPGPKey      Public Key to encrypt the file.
 * @param ipfsClient        A TernoaIPFS instance.
 * @param metadata          Optional secret NFT metadata (Title, Description) {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-510-Secret-nft.md here}.
 * @returns                 The data object with the secret NFT IPFS hash (ex: to add as offchain secret metadatas in the extrinsic).
 */
export const secretNftEncryptAndUploadFile = async <T>(
  file: File,
  publicPGPKey: string,
  ipfsClient: TernoaIPFS,
  metadata?: SecretNftMetadataType<T>,
) => {
  if (!file) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - File undefined`)
  const encryptedFile = (await encryptFile(file, publicPGPKey)) as string
  const ipfsRes = await ipfsClient.storeSecretNFT(encryptedFile, publicPGPKey, metadata, file.type)

  return ipfsRes
}

//TODO : Add doc -

export const mintAndUpload = async <T>(
  nftFile: File,
  nftMetadata: NftMetadataType<T>,
  secretNftFile: File,
  secretNftMetadata: NftMetadataType<T>,
  ipfsClient: TernoaIPFS,
  keyring: IKeyringPair,
) => {
  const { privateKey, publicKey } = await generatePGPKeys()
  await getEnclaveHealthStatus()
  const { Hash: offchainDataHash } = await ipfsClient.storeNFT(nftFile, nftMetadata)
  const { Hash: secretOffchainDataHash } = await secretNftEncryptAndUploadFile(
    secretNftFile,
    publicKey,
    ipfsClient,
    secretNftMetadata,
  )
  const { nftId } = await createSecretNft(
    offchainDataHash,
    secretOffchainDataHash,
    0,
    undefined,
    false,
    keyring,
    WaitUntil.BlockInclusion,
  )
  const shares = generateSSSShares(privateKey)
  const payloads = shares.map((share: string) => formatPayload(nftId, share, keyring))
  const sgxRes = await sgxSSSSharesUpload(0, payloads)
  return sgxRes
}
