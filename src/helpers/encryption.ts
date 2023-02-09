import * as openpgp from "openpgp"
import { File } from "formdata-node"

import { PGPKeysType } from "./types"
import { convertFileToBuffer } from "./utils"

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

  return encryptedContent as string
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
