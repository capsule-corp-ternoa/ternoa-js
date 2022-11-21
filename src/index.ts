// import { encryptAndUploadFile, generatePGPKeys, secretNftIpfsUpload } from "./helpers/encryption"
// import { generateSSSShares, sgxSSSSharesUpload } from "./helpers/sgx"
// import { initializeApi } from "./blockchain"
// import { createSecretNft, nftIpfsUpload } from "./nft"
// import { getKeyringFromSeed } from "./account"
// import { WaitUntil } from "./constants"

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

import { sgxApi, setSgxApis } from "./helpers/sgxInstance"
import { ipfsApi, setIpfsApis } from "./helpers/ipfsInstance"

const test = async () => {
  console.log("1", sgxApi)
  setIpfsApis({
    alphanet: {
      baseURL: "https://ipfs-dev.trnnfr.com",
      apiKey: "3hR7ziS3.con7hqVhS9feH43huFaTq3lFV6fdeUik",
    },
    mainnet: {
      baseURL: "https://ipfs-mainnet.trnnfr.com",
      apiKey: "3hR7ziS3.con7hqVhS9feH43huFaTq3lFV6fdeUik",
    },
  })
  setSgxApis([
    "https://worker-ca-0.trnnfr.com",
    "https://worker-ca-1.trnnfr.com",
    "https://worker-ca-2.trnnfr.com",
    "https://worker-ca-3.trnnfr.com",
    "https://worker-ca-4.trnnfr.com",
  ])
  console.log("2", sgxApi)

  await sgxApi[0].post("/api/v0/add", {})
}
test()
// const NFT_METADATA = {
//   file: new File(["Random datas"], "Fake File"),
//   title: "Title",
//   description: "Description",
// }
// const SECRET_NFT_METADATA = {
//   file: new File(["Random secret datas"], "Fake Secret File"),
//   title: "Secret Title",
//   description: "Secret Description",
// }
// const main = async () => {
//   await initializeApi("wss://dev-1.ternoa.network")
//   const keyring = await getKeyringFromSeed("broccoli tornado verb crane mandate wise gap shop mad quarter jar snake")
//   // 0- generate keys
//   const { privateKey, publicKey } = await generatePGPKeys()
//   console.log(privateKey, publicKey)
//   // 1.1- Encrypt and upload
//   const { hash: secretOffchainDataHash } = await secretNftIpfsUpload(publicKey, SECRET_NFT_METADATA)
//   console.log(secretOffchainDataHash)
//   const { hash: offchainDataHash } = await nftIpfsUpload(NFT_METADATA)
//   console.log(offchainDataHash)

//   const { nftId } = await createSecretNft(
//     offchainDataHash,
//     secretOffchainDataHash,
//     0,
//     undefined,
//     false,
//     keyring,
//     WaitUntil.BlockInclusion,
//   )
//   console.log(nftId)

//   // 2.1- Generate SSS Shares
//   const shares = generateSSSShares(privateKey)
//   console.log(shares)

//   const sgxResponse = await sgxSSSSharesUpload(shares, nftId, keyring)
//   console.log(sgxResponse)
//   //return sgxResponse
// }
// main()
