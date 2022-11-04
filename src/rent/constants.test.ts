import {
  getAccountSizeLimit,
  getActionsInBlockLimit,
  getMaximumContractAvailabilityLimit,
  getMaximumContractDurationLimit,
  getSimultaneousContractLimit,
} from "./constants"

import { initializeApi } from "../blockchain"

beforeAll(() => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  return initializeApi(endpoint)
})

it("Tests rent account size limit to be defined", () => {
  const actual = getAccountSizeLimit()
  expect(actual).toBeDefined()
})

it("Tests the maximum rent actions in block to be defined", () => {
  const actual = getActionsInBlockLimit()
  expect(actual).toBeDefined()
})

it("Tests the maximum of blocks during which a rent contract is available  to be defined", () => {
  const actual = getMaximumContractAvailabilityLimit()
  expect(actual).toBeDefined()
})

it("Tests the maximum of blocks that a contract can last for.", () => {
  const actual = getMaximumContractDurationLimit()
  expect(actual).toBeDefined()
})

it("Tests the maximum number of simultaneous rent contract to be defined", () => {
  const actual = getSimultaneousContractLimit()
  expect(actual).toBeDefined()
})
