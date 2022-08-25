import BN from "bn.js"
import { consts } from "../blockchain"
import { txPallets, chainConstants } from "../constants"

/**
 * @name getMarketplaceOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getMarketplaceOffchainDataLimit = async (): Promise<number> => {
  const limit = consts(txPallets.marketplace, chainConstants.offchainDataLimit)
  return (limit as any as BN).toNumber()
}

/**
 * @name getMarketplaceAccountSizeLimit
 * @summary The maximum number of accounts that can be stored inside the account list.
 * @returns Number.
 */
export const getMarketplaceAccountSizeLimit = async (): Promise<number> => {
  const limit = consts(txPallets.marketplace, chainConstants.accountSizeLimit)
  return (limit as any as BN).toNumber()
}
