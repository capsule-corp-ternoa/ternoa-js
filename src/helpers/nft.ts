import { IKeyringPair } from "@polkadot/types/types"
import { mnemonicGenerate } from "@polkadot/util-crypto"
import { File } from "formdata-node"

import { getKeyringFromSeed } from "../account"
import { getRawApi } from "../blockchain"
import { Errors, WaitUntil } from "../constants"
import { createSecretNft } from "../nft"

import { TernoaIPFS } from "./ipfs"
import { encryptFile, generatePGPKeys } from "./encryption"
import { formatPayload, generateSSSShares, getEnclaveHealthStatus, teeSSSSharesUpload } from "./tee"
import { MediaMetadataType, NftMetadataType } from "./types"

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
 * @param file               File to upload as the preview of the encrypted NFT.
 * @param nftMetadata        NFT metadata (Title, Description).
 * @param secretNftFile      File to encrypt and then upload on IPFS.
 * @param secretNftMetadata  Secret NFT metadata (Title, Description).
 * @param ipfsClient         A TernoaIPFS instance.
 * @param keyring            Account of the secret NFT's owner.
 * @param clusterId          The TEE Cluster id.
 * @returns                  TEE enclave response including both the shards datas, and the enclave response.
 */
export const mintSecretNFT = async <T>(
  nftFile: File,
  nftMetadata: NftMetadataType<T>,
  secretNftFile: File,
  secretNftMetadata: NftMetadataType<T>,
  ipfsClient: TernoaIPFS,
  owner: IKeyringPair,
  clusterId = 0,
) => {
  // 0. query Enclave with /Health API
  await getEnclaveHealthStatus(clusterId)

  // 1. generate a temporary signer account with soft-derivation
  const api = getRawApi()
  const lastBlockDatas = await api.rpc.chain.getBlock()
  const lastBlockId = Number(lastBlockDatas.block.header.number.toString()) - 3

  const tmpSignerMnemonic = mnemonicGenerate()
  const tmpSigner = await getKeyringFromSeed(tmpSignerMnemonic, undefined, `${lastBlockId}_${owner.address}`)

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
    owner,
    WaitUntil.BlockInclusion,
  )

  // 4. generate secret shares from the private key
  const shares = generateSSSShares(privateKey)

  // 5. format payloads with signature of the public key of temporary signer account
  const payloads = shares.map((share: string) => formatPayload(owner, tmpSigner, nftId, share, lastBlockId))

  // 6. request to store a batch of secret shares to the enclave
  const teeRes = await teeSSSSharesUpload(0, payloads)
  return teeRes
}
