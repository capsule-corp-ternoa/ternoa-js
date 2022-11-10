// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { combine, split } from "shamirs-secret-sharing"
import { IKeyringPair } from "@polkadot/types/types"
import { u8aToHex } from "@polkadot/util"

import axios from "axios"

export const SSSA_NUMSHARES = 1
export const SSSA_THRESHOLD = 1

export const SGX_STORE_ENDPOINT = "/api/nft/storeSecretShares"
export const SGX_RETRIEVE_ENDPOINT = "/api/nft/retrieveSecretShares"

export type SecretPayload = {
  account_address: string
  secret_data: string
  signature: string
}

/**
 * @name generateSSSShares
 * @summary             TODO
 * @param privateKey    TODO
 * @returns             TODO
 */
export const generateSSSShares = (privateKey: string): string[] => {
  const shares = split(privateKey, {
    shares: SSSA_NUMSHARES,
    threshold: SSSA_THRESHOLD,
  })
  const base64shares: string[] = shares.map((bufferShare: any) => bufferShare.toString("base64"))

  return base64shares
}

/**
 * @name combineSSSShares
 * @summary             TODO
 * @param shares        TODO
 * @returns             TODO
 */
export const combineSSSShares = (shares: string[]): string => {
  const hexShares = shares.map((bufferShare) => Buffer.from(bufferShare, "base64").toString("hex"))
  const combinedShares = combine(hexShares)
  return combinedShares.toString("utf8")
}

/**
 * @name getSgxEnclaves
 * @summary             TODO
 * @returns             TODO
 */
export const getSgxEnclaves = async () => {
  // query storage to chain
  return ["https://15.235.119.14:3000"]
}

/**
 * @name getSignature
 * @summary             TODO
 * @param keyring       TODO
 * @param secretData    TODO
 * @returns             TODO
 */
export const getSignature = (keyring: IKeyringPair, secretData: string) => {
  const finalData = new Uint8Array(Buffer.from(secretData))
  return u8aToHex(keyring.sign(finalData))
}

/**
 * @name formatPayload
 * @summary             TODO
 * @param nftId       TODO
 * @param share       TODO
 * @param keyring       TODO
 * @returns             TODO
 */
export const formatPayload = (nftId: number, share: string, keyring: IKeyringPair): SecretPayload => {
  const secretData = `${nftId}_${share}`
  const signature = getSignature(keyring, secretData)

  console.log("SecretData: ", secretData)
  console.log("Signature: ", signature)
  return {
    account_address: keyring.address,
    secret_data: secretData,
    signature,
  }
}

/**
 * @name sgxUpload
 * @summary             TODO
 * @param baseUrl       TODO
 * @param secretPayload TODO
 * @returns             TODO
 */
export const sgxUpload = async (baseUrl: string, secretPayload: SecretPayload) => {
  await axios
    .request({
      method: "post",
      url: `${baseUrl}${SGX_STORE_ENDPOINT}`,
      headers: { "Content-Type": "application/json" },
      data: secretPayload,
    })
    .catch((err) => {
      throw new Error(err)
    })
}

/**
 * @name sgxSSSSharesUpload
 * @summary             TODO
 * @param shares       TODO
 * @param nftId       TODO
 * @param keyring       TODO
 * @returns             TODO
 */
export const sgxSSSSharesUpload = async (shares: string[], nftId: number, keyring: IKeyringPair) => {
  const sgxEnclaves = await getSgxEnclaves()
  const sharesUpload = await Promise.all(
    shares.map((share, idx) => {
      //const share = new Uint8Array(Buffer.from(s))
      const secretPayload = formatPayload(nftId, share, keyring)
      console.log("secretPayload: ", secretPayload)
      const enclaveBaseUrl = sgxEnclaves[idx]
      return sgxUpload(enclaveBaseUrl, secretPayload)
    }),
  )
  return sharesUpload
}

//nftID, pgpPrivateKey, addressPubTernoa, keyring
{
  // generateSSSShares
  // getSgxEnclaves
  // getSignature <- Keyring
  // formatterPostData
  // const encryptedSGXData = await cryptData(sgxData, serverPGPKey) ?????
  // sgxSSSSharesUpload
}

//nftID, pgpPrivateKey, addressPubTernoa, signature
{
  // generateSSSShares
  // getSgxEnclaves
  // getSignature
  // formatterPostData
  // sgxSSSSharesUpload
}
