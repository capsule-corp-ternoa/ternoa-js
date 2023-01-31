import { initializeApi } from "../blockchain"
import {
  getProtocolsActionsInBlockLimit,
  getSimultaneousTransmissionLimit,
  getMaxConsentListSize,
  getMaxBlockDuration,
} from "./constants"

beforeAll(() => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  return initializeApi(endpoint)
})

it("Maximum number of actions in one block should be defined", () => {
  const actual = getProtocolsActionsInBlockLimit()
  expect(actual).toBeDefined()
})

it("Maximum number of simultaneous transmission protocol should be defined", () => {
  const actual = getSimultaneousTransmissionLimit()
  expect(actual).toBeDefined()
})

it("aximum size for the consent list should be defined", () => {
  const actual = getMaxConsentListSize()
  expect(actual).toBeDefined()
})

it("Maximum block duration for a protocol should be defined", () => {
  const actual = getMaxBlockDuration()
  expect(actual).toBeDefined()
})
