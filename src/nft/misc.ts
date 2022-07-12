import { Errors } from "../constants"
import { getTransferrableBalance } from "../balance"
import {
  getCollectionOffchainDataLimit,
  getCollectionSizeLimit,
  getInitialMintFee,
  getNftOffchainDataLimit,
} from "./constants"

/**
 * @name formatRoyalty
 * @summary Checks that royalty is in range 0 to 100 and format to permill.
 * @param royalty Number in range from 0 to 100 with max 4 decimals.
 * @returns The royalty in permill format.
 */
export const formatRoyalty = async (royalty: number): Promise<number> => {
  if (royalty > 100 || royalty < 0) {
    throw new Error(Errors.ROYALTY_MUST_BE_PERCENTAGE)
  }

  return parseFloat(royalty.toFixed(4)) * 10000
}

/**
 * @name canPayNftMintFee
 * @summary Checks if an account has enough funds to pay the NFT mint fee.
 * @param address Public address of the account to check balance to mint an NFT.
 * @return True if the account can afford to pay the NFT mint fee.
 */
export const canPayNftMintFee = async (address: string): Promise<boolean> => {
  const balance = await getTransferrableBalance(address)
  const nftMintFee = await getInitialMintFee()

  return balance.gt(nftMintFee)
}

/**
 * @name checkNftOffchainDataLimit
 * @summary Checks if the nftOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 * @return True if the given length is in range.
 */
export const checkNftOffchainDataLimit = async (limit: number): Promise<boolean> => {
  const dataLimit = await getNftOffchainDataLimit()

  return dataLimit >= limit
}

/**
 * @name checkCollectionOffchainDataLimit
 * @summary Checks if the collectionOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkCollectionOffchainDataLimit = async (limit: number): Promise<boolean> => {
  const dataLimit = await getCollectionOffchainDataLimit()

  return dataLimit >= limit
}

/**
 * @name checkCollectionSizeLimit
 * @summary Checks if the collection limit is lower than maximum limit.
 * @param limit Collection limit.
 */
export const checkCollectionSizeLimit = async (limit: number): Promise<boolean> => {
  const dataLimit = await getCollectionSizeLimit()

  return dataLimit >= limit
}

/**
 * @name compareData
 * @summary Compares the current value of a extrinsic attribute to the new one to avoid running a transaction if they are equal.
 * @param data Current values to be compared.
 * @param attribute Attribute of the element to compare. (ex: nft.royalty, marketplace.commission_fee)
 * @param value New value to be compared to current data.
 */
export const compareData = async <T>(data: T, attribute: string, value: T): Promise<void> => {
  if (value !== (null || undefined) && data === value)
    throw new Error(`The ${attribute.replace(/_/g, " ")} is already set to : ${value}`)
}
