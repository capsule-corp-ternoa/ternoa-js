// import { generatePGPKeys, secretNftEncryptAndUploadFile } from "./helpers/encryption"
// import { formatPayload, generateSSSShares, sgxSSSSharesUpload } from "./helpers/sgx"
// import { initializeApi } from "./blockchain"
// import { createSecretNft } from "./nft"
// import { getKeyringFromSeed } from "./account"
// import { WaitUntil } from "./constants"
// import { getEnclaveHealthStatus, TernoaIPFS } from "./helpers"
// import { File } from "formdata-node"

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

// const NFT_FILE = new File(["Random datas"], "Fake File") as File
// const NFT_METADATA = {
//   title: "Title",
//   description: "Description",
// }
// const SECRET_NFT_FILE = new File(["Random secret datas"], "Fake Secret File") as File

// const SECRET_NFT_METADATA = {
//   title: "Secret Title",
//   description: "Secret Description",
// }
// const main = async () => {
//   try {
//     await initializeApi("wss://dev-0.ternoa.network")
//     const keyring = await getKeyringFromSeed("broccoli tornado verb crane mandate wise gap shop mad quarter jar snake")
//     const { privateKey, publicKey } = await generatePGPKeys()
//     const ipfsClient = new TernoaIPFS(new URL("https://ipfs-dev.trnnfr.com"), "98791fae-d947-450b-a457-12ecf5d9b858")

//     await getEnclaveHealthStatus()

//     const { Hash: offchainDataHash } = await ipfsClient.storeNFT(NFT_FILE, NFT_METADATA)
//     console.log(offchainDataHash)
//     const { Hash: secretOffchainDataHash } = await secretNftEncryptAndUploadFile(
//       SECRET_NFT_FILE,
//       publicKey,
//       ipfsClient,
//       SECRET_NFT_METADATA,
//     )
//     console.log(secretOffchainDataHash)

//     const { nftId } = await createSecretNft(
//       offchainDataHash,
//       secretOffchainDataHash,
//       0,
//       undefined,
//       false,
//       keyring,
//       WaitUntil.BlockInclusion,
//     )
//     console.log(nftId)

//     //SGX
//     const shares = generateSSSShares(privateKey)
//     const payloads = shares.map((share: string) => formatPayload(nftId, share, keyring))

//     const res = await sgxSSSSharesUpload(0, payloads)
//     console.log("res", res)
//   } catch (error) {
//     console.log(error)
//   } finally {
//     process.exit()
//   }
// }
// main()
