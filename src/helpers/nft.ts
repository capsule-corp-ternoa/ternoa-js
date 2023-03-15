import { IKeyringPair } from "@polkadot/types/types"
import { mnemonicGenerate } from "@polkadot/util-crypto"
import { File } from "formdata-node"

import { TernoaIPFS } from "./ipfs"
import { decryptFile, encryptFile, generatePGPKeys } from "./encryption"
import {
  combineKeyShares,
  formatStorePayload,
  formatRetrievePayload,
  generateKeyShares,
  getEnclaveHealthStatus,
  teeKeySharesRetrieve,
  teeKeySharesStore,
  SIGNER_BLOCK_VALIDITY,
} from "./tee"
import { CapsuleMedia, MediaMetadataType, NftMetadataType, PGPKeysType, RequesterType } from "./types"
import { getLastBlock, getSignatureFromExtension, getSignatureFromKeyring } from "./crypto"

import { getKeyringFromSeed } from "../account"
import { Errors, WaitUntil } from "../constants"
import { createCapsule, createSecretNft, getSecretNftOffchainData } from "../nft"
import { isValidAddress } from "../blockchain"

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
 * @name getTemporarySignerKeys
 * @summary                 Generates a temporary signer account with soft-derivation
 * @param address           The owner address
 * @param lastBlockId       The last chain block number: Use our asyncronous getLastBlock() helper.
 * @returns                 A temporary signing key pair.
 */
export const getTemporarySignerKeys = async (address: string, lastBlockId: number) => {
  const tmpSignerMnemonic = mnemonicGenerate()
  const tmpSignerPair = await getKeyringFromSeed(tmpSignerMnemonic, undefined, `${lastBlockId}_${address}`)
  return tmpSignerPair
}

/**
 * @name prepareAndStoreKeyShares
 * @summary                  Splits the private key into shards, format and send them for upload on to a Tee Cluster.
 * @param privateKey         The private key to be splited with Shamir algorithm.
 * @param ownerPair          Account owner of the private key to split.
 * @param nftId              The Capsule NFT id or Secret NFT id to link to the private key.
 * @param kind               The kind of nft linked to the key to upload: "secret" or "capsule".
 * @param clusterId          The TEE Cluster id.
 * @returns                  The TEE enclave response (shards datas and description).
 */
export const prepareAndStoreKeyShares = async (
  privateKey: string,
  signer: IKeyringPair | string,
  nftId: number,
  kind: "secret" | "capsule",
  extensionInjector?: Record<string, any>,
  clusterId = 0,
) => {
  if (kind !== "secret" && kind !== "capsule") {
    throw new Error(`${Errors.TEE_UPLOAD_ERROR} : Kind must be either "secret" or "capsule"`)
  }
  if (typeof signer === "string" && !extensionInjector)
    throw new Error(
      `${Errors.TEE_UPLOAD_ERROR} - INJECTOR_SIGNER_MISSING : injectorSigner must be provided when signer is of type string`,
    )
  if (typeof signer === "string" && !isValidAddress(signer)) throw new Error("INVALID_ADDRESS_FORMAT")

  // 0. retrieve last chain block number and generate a temporary signer account with soft-derivation
  const lastBlockId = await getLastBlock()
  const tmpSignerPair = await getTemporarySignerKeys(typeof signer === "string" ? signer : signer.address, lastBlockId)
  // 1. generate secret shares from the private key
  const shares = generateKeyShares(privateKey)
  // 2. format payloads with temporary signer account
  const signerAuthMessage = `<Bytes>${tmpSignerPair.address}_${lastBlockId}_${SIGNER_BLOCK_VALIDITY}</Bytes>`
  const signerAuthSignature =
    typeof signer === "string"
      ? extensionInjector && (await getSignatureFromExtension(signer, extensionInjector, signerAuthMessage))
      : getSignatureFromKeyring(signer, signerAuthMessage)
  if (signerAuthSignature) {
    const payloads = await Promise.all(
      shares.map((share: string) =>
        formatStorePayload(
          typeof signer === "string" ? signer : signer.address,
          signerAuthMessage,
          signerAuthSignature,
          tmpSignerPair,
          nftId,
          share,
          lastBlockId,
        ),
      ),
    )
    // 3. request to store a batch of secret shares to the enclave
    return await teeKeySharesStore(clusterId, kind, payloads)
  }
}

/**
 * @name mintSecretNFT
 * @summary                  Encrypts your data to create a secret NFT and uploads your key's shards on a TEE.
 * @param nftFile            File to upload as the preview of the encrypted NFT.
 * @param nftMetadata        NFT metadata (Title, Description).
 * @param secretNftFile      File to encrypt and then upload on IPFS.
 * @param secretNftMetadata  Secret NFT metadata (Title, Description).
 * @param ipfsClient         A TernoaIPFS instance.
 * @param ownerPair          Account of the secret NFT's owner.
 * @param clusterId          The TEE Cluster id.
 * @param royalty            Percentage of all second sales that the secret NFT creator will receive. Default is 0%. It's a decimal number in range [0, 100].
 * @param collectionId       The collection to which the secret NFT belongs. Optional Parameter: Default is undefined.
 * @param isSoulbound        If true, makes the secret NFT intransferable. Default is false.
 * @returns                  A JSON including both secretNftEvent & TEE enclave response (shards datas and description).
 */
export const mintSecretNFT = async <T>(
  nftFile: File,
  nftMetadata: NftMetadataType<T>,
  secretNftFile: File,
  secretNftMetadata: NftMetadataType<T>,
  ipfsClient: TernoaIPFS,
  ownerPair: IKeyringPair,
  clusterId = 0,
  royalty = 0,
  collectionId: number | undefined = undefined,
  isSoulbound = false,
) => {
  // 0. query Enclave with /Health API
  await getEnclaveHealthStatus(clusterId)

  // 1. media encryption and upload
  const { privateKey, publicKey } = await generatePGPKeys()
  const { Hash: offchainDataHash } = await ipfsClient.storeNFT(nftFile, nftMetadata)
  const { Hash: secretOffchainDataHash } = await secretNftEncryptAndUploadFile(
    secretNftFile,
    publicKey,
    ipfsClient,
    secretNftMetadata,
  )

  // 2. secret NFT minting
  const secretNftEvent = await createSecretNft(
    offchainDataHash,
    secretOffchainDataHash,
    royalty,
    collectionId,
    isSoulbound,
    ownerPair,
    WaitUntil.BlockInclusion,
  )

  // 3. request to format and store a batch of secret shares to the enclave
  const teeRes = await prepareAndStoreKeyShares(privateKey, ownerPair, secretNftEvent.nftId, "secret")

  return {
    event: secretNftEvent,
    clusterResponse: teeRes,
  }
}

/**
 * @name viewSecretNFT
 * @summary                  Retrieves and decrypts the secret NFT hash.
 * @param nftId              The secret NFT id.
 * @param ipfsClient         A TernoaIPFS instance.
 * @param requesterPair      Account of the secret NFT's owner or the decrypter account if NFT is delegated or rented.
 * @param requesterRole      Kind of the secret NFT's decrypter: it can be either "OWNER", "DELEGATEE" or "RENTEE"
 * @param clusterId          The TEE Cluster id.
 * @returns                  A string containing the secretNFT decrypted content.
 */
export const viewSecretNFT = async (
  nftId: number,
  ipfsClient: TernoaIPFS,
  requesterPair: IKeyringPair,
  requesterRole: RequesterType,
  clusterId = 0,
) => {
  await getEnclaveHealthStatus(clusterId)

  const lastBlockId = await getLastBlock()
  const secretNftOffchainData = await getSecretNftOffchainData(nftId)
  const secretNftData = (await ipfsClient.getFile(secretNftOffchainData)) as any
  const encryptedSecretOffchainData = (await ipfsClient.getFile(
    secretNftData.properties.encrypted_media.hash,
  )) as string

  const payload = formatRetrievePayload(requesterPair, requesterRole, nftId, lastBlockId)
  const shares = await teeKeySharesRetrieve(clusterId, "secret", payload)
  const privatePGPKey = combineKeyShares(shares)

  const decryptedBase64 = await decryptFile(encryptedSecretOffchainData, privatePGPKey)
  return decryptedBase64
}

/**
 * @name mintCapsuleNFT
 * @summary                   Create a Capsule NFT and uploads your key's shards on a TEE.
 * @param owner               Account of the Capsule NFT's owner.
 * @param ipfsClient          A TernoaIPFS instance.
 * @param keys                Public and Private keys used to encrypt the file.
 * @param nftFile             File to upload as the preview of the Capsule NFT.
 * @param nftMetadata         The NFT preview metadata (Title, Description).
 * @param encryptedMedia      The array containing all the Capsule NFT encrypted media.
 * @param capsuleMetadata     (Optional) The Capusle NFT public metadata (Title, Description...).
 * @param clusterId           The TEE Cluster id. Default is 0
 * @param capsuleRoyalty      Percentage of all second sales that the capsule creator will receive. Default is 0%. It's a decimal number in range [0, 100].
 * @param capsuleCollectionId The collection to which the capsule NFT belongs. Optional Parameter: Default is undefined.
 * @param isSoulbound         If true, makes the Capsule intransferable. Default is false.
 * @returns                   A JSON including both capsuleEvent & TEE enclave response (shards datas and description).
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
  capsuleRoyalty = 0,
  capsuleCollectionId: number | undefined = undefined,
  isSoulbound = false,
) => {
  // 0. query Enclave with /Health API
  await getEnclaveHealthStatus(clusterId)

  // 1. media encryption and upload
  const { Hash: offchainDataHash } = await ipfsClient.storeNFT(nftFile, nftMetadata)
  const { Hash: capsuleOffchainDataHash } = await ipfsClient.storeCapsuleNFT(
    keys.publicKey,
    encryptedMedia,
    capsuleMetadata,
  )

  // 2. capsule NFT minting
  const capsuleEvent = await createCapsule(
    offchainDataHash,
    capsuleOffchainDataHash,
    capsuleRoyalty,
    capsuleCollectionId,
    isSoulbound,
    ownerPair,
    WaitUntil.BlockInclusion,
  )

  // 3. request to format and store a batch of secret shares to the enclave
  const teeRes = await prepareAndStoreKeyShares(keys.privateKey, ownerPair, capsuleEvent.nftId, "capsule")
  return {
    event: capsuleEvent,
    clusterResponse: teeRes,
  }
}

/**
 * @name getCapsuleNFTPrivateKey
 * @summary                  Retrieves the capsule NFT private key to decrypt the secret hashes from properties.
 * @param nftId              The capsule NFT id.
 * @param requesterPair      Account of the capsule NFT's owner or the decrypter account if NFT is delegated or rented.
 * @param requesterRole      Kind of the capsule NFT's decrypter: it can be either "OWNER", "DELEGATEE" or "RENTEE"
 * @param clusterId          The TEE Cluster id.
 * @returns                  A string containing the capsule NFT private key.
 */
export const getCapsuleNFTPrivateKey = async (
  nftId: number,
  requesterPair: IKeyringPair,
  requesterRole: RequesterType,
  clusterId = 0,
): Promise<string> => {
  await getEnclaveHealthStatus(clusterId)
  const lastBlockId = await getLastBlock()
  const payload = formatRetrievePayload(requesterPair, requesterRole, nftId, lastBlockId)
  const shares = await teeKeySharesRetrieve(clusterId, "capsule", payload)
  return combineKeyShares(shares)
}
