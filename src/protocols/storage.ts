import BN from "bn.js"
import { query } from "../blockchain"
import { chainQuery, Errors, txPallets } from "../constants"
import { ProtocolAtBlockQueue, Transmissions } from "./types"

/**
 * @name getTransmissionAtBlockFee
 * @summary Fee to set an AtBlock protocol. (extra fee on top of the tx fees).
 * @returns Transmission at block protocol fee.
 */
export const getTransmissionAtBlockFee = async (): Promise<BN> => {
  const fee = await query(txPallets.transmissionProtocols, chainQuery.atBlockFee)
  return fee as any as BN
}

/**
 * @name getTransmissionAtBlockWithResetFee
 * @summary Fee to set an AtBlockWithReset protocol. (extra fee on top of the tx fees).
 * @returns Transmission at block with reset protocol fee.
 */
export const getTransmissionAtBlockWithResetFee = async (): Promise<BN> => {
  const fee = await query(txPallets.transmissionProtocols, chainQuery.atBlockWithResetFee)
  return fee as any as BN
}

/**
 * @name getTransmissionOnConsentFee
 * @summary Fee to set an OnConsentFee protocol. (extra fee on top of the tx fees).
 * @returns Transmission on consent protocol fee.
 */
export const getTransmissionOnConsentFee = async (): Promise<BN> => {
  const fee = await query(txPallets.transmissionProtocols, chainQuery.onConsentFee)
  return fee as any as BN
}

/**
 * @name getTransmissionOnConsentAtBlockFee
 * @summary Fee to set an OnConsentAtBlockFee protocol. (extra fee on top of the tx fees).
 * @returns Transmission on consent at block protocol fee.
 */
export const getTransmissionOnConsentAtBlockFee = async (): Promise<BN> => {
  const fee = await query(txPallets.transmissionProtocols, chainQuery.onConsentAtBlockFee)
  return fee as any as BN
}

/**
 * @name getTransmissionAtBlockQueue
 * @summary         Provides the deadlines related to at block transmission protocols in queues.
 * @returns         An array of objects containing data related to tranmission queues.
 */
export const getTransmissionAtBlockQueue = async (): Promise<ProtocolAtBlockQueue[]> => {
  try {
    const data = (await query(txPallets.transmissionProtocols, chainQuery.atBlockQueue)).toJSON() as [[number, number]]
    return data.map((queue) => ({
      nftId: queue[0],
      blockNumber: queue[1],
    }))
  } catch (error) {
    throw new Error(`${Errors.TRANSMISSION_PROTOCOL_CONVERSION_ERROR}`)
  }
}

/**
 * @name getTransmissions
 * @summary         Provides the data of a set transmission protocol.
 * @param nftId     The ID of the NFT to be transmitted.
 * @returns         An object containing data related to a tranmission protocol.
 */
export const getTransmissions = async (nftId: number): Promise<Transmissions | null> => {
  const data = await query(txPallets.transmissionProtocols, chainQuery.transmissions, [nftId])
  return data.toJSON() as Transmissions
}

/**
 * @name getTransmissionOnConsentData
 * @summary       Provides the list of address that gave their consent to a transmission protocol.
 * @param nftId   The ID of the NFT to check address that gave their consent.
 * @returns       An array of the account address that gave their consent.
 */
export const getTransmissionOnConsentData = async (nftId: number): Promise<string[]> => {
  const data = (await query(txPallets.transmissionProtocols, chainQuery.onConsentData, [nftId])).toJSON()
  return data as string[]
}
