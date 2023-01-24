import { decryptFile, generatePGPKeys, mintAndUpload, secretNftEncryptAndUploadFile } from "./helpers/encryption"
import {
  combineSSSShares,
  formatPayload,
  generateSSSShares,
  teeSSSSharesRetrieve,
  teeSSSSharesUpload,
} from "./helpers/tee"
import { initializeApi } from "./blockchain"
import { createSecretNft, getSecretNftOffchainData } from "./nft"
import { getKeyringFromSeed } from "./account"
import { WaitUntil } from "./constants"
import { getEnclaveHealthStatus, SecretPayloadType, TernoaIPFS } from "./helpers"
import { File } from "formdata-node"

export * from "./account"
export * from "./assets"
export * from "./auction"
export * from "./balance"
export * from "./blockchain"
export * from "./helpers"
export * from "./nft"
export * from "./rent"
export * from "./marketplace"
export * from "./events"
export * from "./constants"

export * as Account from "./account"
export * as Assets from "./assets"
export * as Auction from "./auction"
export * as Balance from "./balance"
export * as Blockchain from "./blockchain"
export * as TernoaHelpers from "./helpers"
export * as Nft from "./nft"
export * as Rent from "./rent"
export * as Marketplace from "./marketplace"
export * as TernoaEvents from "./events"
export * as TernoaConstants from "./constants"

export { hexToString, hexToU8a, stringToHex, u8aToHex } from "@polkadot/util"
export { Blob, File, FormData } from "formdata-node"

const NFT_FILE = new File(["Music NFT"], "Fake File - Music") as File
const NFT_METADATA = {
  title: "Title - Music",
  description: "Description - Music",
}
const SECRET_NFT_FILE = new File(["Secret datas: Mac Miller New Album"], "Fake Secret File : Mac Miller") as File

const SECRET_NFT_METADATA = {
  title: "Secret Title - Mac Miller",
  description: "Secret Description - Mac Miller",
}
let NFT_ID: number

const mint = async () => {
  try {
    await initializeApi("wss://dev-0.ternoa.network")
    const keyring = await getKeyringFromSeed("broccoli tornado verb crane mandate wise gap shop mad quarter jar snake")
    const ipfsClient = new TernoaIPFS(new URL("https://ipfs-dev.trnnfr.com"), "98791fae-d947-450b-a457-12ecf5d9b858")
    // const mintAndUploadNFT = await mintAndUpload(
    //   NFT_FILE,
    //   NFT_METADATA,
    //   SECRET_NFT_FILE,
    //   SECRET_NFT_METADATA,
    //   ipfsClient,
    //   keyring,
    // )
    // console.log("TEE_UPLOAD_RES", mintAndUploadNFT)

    const { privateKey, publicKey } = await generatePGPKeys()

    await getEnclaveHealthStatus()

    const { Hash: offchainDataHash } = await ipfsClient.storeNFT(NFT_FILE, NFT_METADATA)
    const { Hash: secretOffchainDataHash } = await secretNftEncryptAndUploadFile(
      SECRET_NFT_FILE,
      publicKey,
      ipfsClient,
      SECRET_NFT_METADATA,
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
    console.log(`NFT_ID: ${nftId}`)

    NFT_ID = nftId

    //TEE
    const shares = generateSSSShares(privateKey)
    const payloads = shares.map((share: string) => formatPayload(nftId, share, keyring))

    const res = await teeSSSSharesUpload(0, payloads)
    // console.log("TEE_UPLOAD_RES", res)
  } catch (error) {
    console.log(error)
  } finally {
    show(NFT_ID)
  }
}

const show = async (NFT_ID: number) => {
  try {
    await initializeApi("wss://dev-0.ternoa.network")
    const keyring = await getKeyringFromSeed("broccoli tornado verb crane mandate wise gap shop mad quarter jar snake")

    const secretNftOffchainData = await getSecretNftOffchainData(NFT_ID)

    const ipfsClient = new TernoaIPFS(new URL("https://ipfs-dev.trnnfr.com"), "98791fae-d947-450b-a457-12ecf5d9b858")
    const secretNftData = (await ipfsClient.getFile(secretNftOffchainData)) as any

    const encryptedSecretOffchainData = (await ipfsClient.getFile(
      secretNftData.properties.encrypted_media.hash,
    )) as string

    const payload: SecretPayloadType = formatPayload(NFT_ID, null, keyring)
    const shares = await teeSSSSharesRetrieve(0, payload)
    // console.log("showSecretNFT shares", shares)

    const privatePGPKey = combineSSSShares(shares)
    // console.log("showSecretNFT privatePGPKey", privatePGPKey)

    const decryptedBase64 = (await decryptFile(encryptedSecretOffchainData, privatePGPKey)) as string
    console.log(decryptedBase64)
  } catch (error) {
    console.log(error)
  } finally {
    process.exit()
  }
}

mint()
