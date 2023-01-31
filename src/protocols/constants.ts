import { consts } from "../blockchain"
import { chainConstants, txPallets } from "../constants"

/**
 * @name getProtocolsActionsInBlockLimit
 * @summary Maximum number of actions in one block.
 * @returns Number.
 */
export const getProtocolsActionsInBlockLimit = (): number => {
  const limit = consts(txPallets.transmissionProtocols, chainConstants.actionsInBlockLimit)
  return Number(limit.toString())
}

/**
 * @name getSimultaneousTransmissionLimit
 * @summary Maximum number of simultaneous transmission protocol.
 * @returns Number.
 */
export const getSimultaneousTransmissionLimit = (): number => {
  const limit = consts(txPallets.transmissionProtocols, chainConstants.simultaneousTransmissionLimit)
  return Number(limit.toString())
}
/**
 * @name getMaxConsentListSize
 * @summary Maximum size for the consent list.
 * @returns Number.
 */
export const getMaxConsentListSize = (): number => {
  const size = consts(txPallets.transmissionProtocols, chainConstants.maxConsentListSize)
  return Number(size.toString())
}

/**
 * @name getMaxBlockDuration
 * @summary Maximum block duration for a protocol.
 * @returns Number.
 */
export const getMaxBlockDuration = (): number => {
  const block = consts(txPallets.transmissionProtocols, chainConstants.maxBlockDuration)
  return Number(block.toString())
}
