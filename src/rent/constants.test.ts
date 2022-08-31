import {
  getAccountSizeLimit,
  getActionsInBlockLimit,
  getContractExpirationDuration,
  getSimultaneousContractLimit,
} from "./constants"

import { initializeApi } from "../blockchain"

beforeAll(() => {
  const endpoint: string | undefined = "wss://dev-1.ternoa.network"
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

it("Tests the maximum number of blocks of contract availablility to be defined", () => {
  const actual = getContractExpirationDuration()
  expect(actual).toBeDefined()
})

it("Tests the maximum number of simultaneous rent contract to be defined", () => {
  const actual = getSimultaneousContractLimit()
  expect(actual).toBeDefined()
})
