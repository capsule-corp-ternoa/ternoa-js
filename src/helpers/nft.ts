import { IKeyringPair } from "@polkadot/types/types"
import { mnemonicGenerate } from "@polkadot/util-crypto"
import { File } from "formdata-node"

import { TernoaIPFS } from "./ipfs"
import { decryptFile, encryptFile, generatePGPKeys } from "./encryption"
import {
  combineSSSShares,
  formatStorePayload,
  formatRetrievePayload,
  generateSSSShares,
  getEnclaveHealthStatus,
  teeSSSSharesRetrieve,
  teeSSSSharesUpload,
  SIGNER_BLOCK_VALIDITY,
} from "./tee"
import { CapsuleMedia, MediaMetadataType, NftMetadataType, PGPKeysType } from "./types"
import { getLastBlock, getSignature } from "./crypto"

import { getKeyringFromSeed } from "../account"
import { Errors, WaitUntil } from "../constants"
import { createCapsule, createSecretNft, getSecretNftOffchainData } from "../nft"

/**
 * @name secretNftEncryptAndUploadFile
 * @summary                 Encrypts and uploads a file on an IFPS gateway.
 * @param file              File to encrypt and then upload on IPFS.
 * @param publicPGPKey      Public Key to encrypt the file.
 * @param ipfsClient        A TernoaIPFS instance.
 * @param nftMetadata       Optional secret NFT metadata (Title, Description, (...)) {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-510-Secret-nft.md here}.
 * @param mediaMetadata     Optional asset NFT metadata (Name, Description, (...)) {@link https://github.com/capsule-corp-ternoa/ternoa-proposals/blob/main/TIPs/tip-510-Secret-nft.md here}.
 * @returns                 The data object with the secret NFT IPFS hash (ex: to add as offchain secret metadatas in the extrinsic).
 */
export const secretNftEncryptAndUploadFile = async <TNFT, TMedia>(
  file: File,
  publicPGPKey: string,
  ipfsClient: TernoaIPFS,
  nftMetadata?: Partial<NftMetadataType<TNFT>>,
  mediaMetadata?: MediaMetadataType<TMedia>,
) => {
  if (!file) throw new Error(`${Errors.IPFS_FILE_UPLOAD_ERROR} - File undefined`)
  const encryptedFile = await encryptFile(file, publicPGPKey)
  const ipfsRes = await ipfsClient.storeSecretNFT(encryptedFile, file.type, publicPGPKey, nftMetadata, mediaMetadata)

  return ipfsRes
}

/**
 * @name mintSecretNFT
 * @summary                  Encrypts your data to create a secret NFT and uploads your key's shards on a TEE.
 * @param nftFile            File to upload as the preview of the encrypted NFT.
 * @param nftMetadata        NFT metadata (Title, Description).
 * @param secretNftFile      File to encrypt and then upload on IPFS.
 * @param secretNftMetadata  Secret NFT metadata (Title, Description).
 * @param ipfsClient         A TernoaIPFS instance.
 * @param owner              Account of the secret NFT's owner.
 * @param clusterId          The TEE Cluster id.
 * @returns                  TEE enclave response including both the shards datas, and the enclave response.
 */
export const mintSecretNFT = async <T>(
  nftFile: File,
  nftMetadata: NftMetadataType<T>,
  secretNftFile: File,
  secretNftMetadata: NftMetadataType<T>,
  ipfsClient: TernoaIPFS,
  ownerPair: IKeyringPair,
  clusterId = 0,
) => {
  // 0. query Enclave with /Health API
  await getEnclaveHealthStatus(clusterId)

  // 1. generate a temporary signer account with soft-derivation
  const lastBlockId = await getLastBlock()
  const tmpSignerMnemonic = mnemonicGenerate()
  const tmpSignerPair = await getKeyringFromSeed(tmpSignerMnemonic, undefined, `${lastBlockId}_${ownerPair.address}`)

  // 2. media encryption and upload
  const { privateKey, publicKey } = await generatePGPKeys()
  const { Hash: offchainDataHash } = await ipfsClient.storeNFT(nftFile, nftMetadata)
  const { Hash: secretOffchainDataHash } = await secretNftEncryptAndUploadFile(
    secretNftFile,
    publicKey,
    ipfsClient,
    secretNftMetadata,
  )

  // 3. secret NFT minting
  const { nftId } = await createSecretNft(
    offchainDataHash,
    secretOffchainDataHash,
    0,
    undefined,
    false,
    ownerPair,
    WaitUntil.BlockInclusion,
  )

  // 4. generate secret shares from the private key
  const shares = generateSSSShares(privateKey)

  // 5. format payloads with signature of the public key of temporary signer account
  const signerAuthMessage = `${tmpSignerPair.address}_${lastBlockId}_${SIGNER_BLOCK_VALIDITY}`
  const signerAuthSignature = getSignature(ownerPair, signerAuthMessage)
  const payloads = shares.map((share: string) =>
    formatStorePayload(
      ownerPair.address,
      signerAuthMessage,
      signerAuthSignature,
      tmpSignerPair,
      nftId,
      share,
      lastBlockId,
    ),
  )

  // 6. request to store a batch of secret shares to the enclave
  const teeRes = await teeSSSSharesUpload(0, "secret", payloads)
  return teeRes
}

/**
 * @name viewSecretNFT
 * @summary                  Retrieves and decrypts the secret NFT hash.
 * @param nftId              The secret NFT id.
 * @param ipfsClient         A TernoaIPFS instance.
 * @param owner              Account of the secret NFT's owner.
 * @param clusterId          The TEE Cluster id.
 * @returns                  A string containing the secretNFT decrypted content.
 */
export const viewSecretNFT = async (nftId: number, ipfsClient: TernoaIPFS, ownerPair: IKeyringPair, clusterId = 0) => {
  await getEnclaveHealthStatus(clusterId)

  const lastBlockId = await getLastBlock()
  const secretNftOffchainData = await getSecretNftOffchainData(nftId)
  const secretNftData = (await ipfsClient.getFile(secretNftOffchainData)) as any
  const encryptedSecretOffchainData = (await ipfsClient.getFile(
    secretNftData.properties.encrypted_media.hash,
  )) as string

  const payload = formatRetrievePayload(ownerPair, nftId, lastBlockId)
  const shares = await teeSSSSharesRetrieve(clusterId, "secret", payload)
  const privatePGPKey = combineSSSShares(shares)

  const decryptedBase64 = await decryptFile(encryptedSecretOffchainData, privatePGPKey)
  return decryptedBase64
}

/**
 * @name mintCapsuleNFT
 * @summary                  Create a Capsule NFT and uploads your key's shards on a TEE.
 * @param owner              Account of the Capsule NFT's owner.
 * @param ipfsClient         A TernoaIPFS instance.
 * @param keys               Public and Private keys used to encrypt the file.
 * @param nftFile            File to upload as the preview of the Capsule NFT.
 * @param nftMetadata        The NFT preview metadata (Title, Description).
 * @param encryptedMedia     The array containing all the Capsule NFT encrypted media.
 * @param capsuleMetadata    (Optional) The Capusle NFT public metadata (Title, Description...).
 * @param clusterId          The TEE Cluster id.
 * @returns                  TEE enclave response including both the shards datas, and the enclave response.
 */
export const mintCapsuleNFT = async <TNFT, TMedia, TCapsule>(
  ownerPair: IKeyringPair,
  ipfsClient: TernoaIPFS,
  keys: PGPKeysType,
  nftFile: File,
  nftMetadata: NftMetadataType<TNFT>,
  encryptedMedia: CapsuleMedia<TMedia>[],
  capsuleMetadata?: Partial<NftMetadataType<TCapsule>>,
  clusterId = 0,
) => {
  // 0. query Enclave with /Health API
  await getEnclaveHealthStatus(clusterId)

  // 1. generate a temporary signer account with soft-derivation
  const lastBlockId = await getLastBlock()
  const tmpSignerMnemonic = mnemonicGenerate()
  const tmpSignerPair = await getKeyringFromSeed(tmpSignerMnemonic, undefined, `${lastBlockId}_${ownerPair.address}`)

  // 2. media encryption and upload
  const { Hash: offchainDataHash } = await ipfsClient.storeNFT(nftFile, nftMetadata)
  const { Hash: capsuleOffchainDataHash } = await ipfsClient.storeCapsuleNFT(
    keys.publicKey,
    encryptedMedia,
    capsuleMetadata,
  )

  // 3. capsule NFT minting
  const { nftId } = await createCapsule(
    offchainDataHash,
    capsuleOffchainDataHash,
    0,
    undefined,
    false,
    ownerPair,
    WaitUntil.BlockInclusion,
  )

  // 4. generate secret shares from the private key
  const shares = generateSSSShares(keys.privateKey)

  // 5. format payloads with signature of the public key of temporary signer account
  const signerAuthMessage = `${tmpSignerPair.address}_${lastBlockId}_${SIGNER_BLOCK_VALIDITY}`
  const signerAuthSignature = getSignature(ownerPair, signerAuthMessage)
  const payloads = shares.map((share: string) =>
    formatStorePayload(
      ownerPair.address,
      signerAuthMessage,
      signerAuthSignature,
      tmpSignerPair,
      nftId,
      share,
      lastBlockId,
    ),
  )

  // 6. request to store a batch of secret shares to the enclave
  const teeRes = await teeSSSSharesUpload(0, "capsule", payloads)
  return teeRes
}

/**
 * @name getCapsuleNFTPrivateKey
 * @summary                  Retrieves the capsule NFT private key to decrypt the secret hashes from properties.
 * @param nftId              The capsule NFT id.
 * @param owner              Account of the capsule NFT's owner.
 * @param clusterId          The TEE Cluster id.
 * @returns                  A string containing the capsule NFT private key.
 */
export const getCapsuleNFTPrivateKey = async (nftId: number, owner: IKeyringPair, clusterId = 0): Promise<string> => {
  await getEnclaveHealthStatus(clusterId)
  const lastBlockId = await getLastBlock()
  const payload = formatRetrievePayload(owner, nftId, lastBlockId)
  const shares = await teeSSSSharesRetrieve(clusterId, "capsule", payload)
  return combineSSSShares(shares)
}
