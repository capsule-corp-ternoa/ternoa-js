import { chainConstants, txPallets } from "../constants"
import { BalanceType, consts } from "../blockchain"

/**
 * @name getAccountSizeLimit
 * @summary The maximum number of accounts that can be stored inside the account list of acceptance.
 * @returns Number.
 */
export const getAccountSizeLimit = (): number => {
  const limit = consts(txPallets.rent, chainConstants.accountSizeLimit)
  return (limit as any as BalanceType).toNumber()
}

/**
 * @name getActionsInBlockLimit
 * @summary Maximum number of related automatic rent actions in block.
 * @returns Number.
 */
export const getActionsInBlockLimit = (): number => {
  const limit = consts(txPallets.rent, chainConstants.actionsInBlockLimit)
  return (limit as any as BalanceType).toNumber()
}

/**
 * @name getMaximumContractAvailabilityLimit
 * @summary Maximum number of blocks during which a rent contract is available.
 * @returns Number.
 */
export const getMaximumContractAvailabilityLimit = (): number => {
  const limit = consts(txPallets.rent, chainConstants.maximumContractAvailabilityLimit)
  return (limit as any as BalanceType).toNumber()
}

/**
 * @name getMaximumContractDurationLimit
 * @summary Maximum number of blocks that a contract can last for.
 * @returns Number.
 */
export const getMaximumContractDurationLimit = (): number => {
  const limit = consts(txPallets.rent, chainConstants.maximumContractDurationLimit)
  return (limit as any as BalanceType).toNumber()
}

/**
 * @name getSimultaneousContractLimit
 * @summary Maximum number of simultaneous rent contract.
 * @returns Number.
 */
export const getSimultaneousContractLimit = (): number => {
  const limit = consts(txPallets.rent, chainConstants.simultaneousContractLimit)
  return (limit as any as BalanceType).toNumber()
}
