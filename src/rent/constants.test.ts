import {
  getAccountSizeLimit,
  getActionsInBlockLimit,
  getContractExpirationDuration,
  getSimultaneousContractLimit,
} from "./constants"

import { initializeApi } from "../blockchain"

beforeAll(() => {
  const endpoint: string | undefined = "wss://dev-1.ternoa.network"
  return initializeApi(endpoint) //not awaited ?
})

it("Tests rent account size limit to be 3", () => {
  const actual = getAccountSizeLimit()
  const expected = 3
  expect(actual).toEqual(expected)
})

it("Tests the maximum rent actions in block to be 10", () => {
  const actual = getActionsInBlockLimit()
  const expected = 10
  expect(actual).toEqual(expected)
})

it("Tests the maximum number of blocks of contract availablility to be 2000", () => {
  const actual = getContractExpirationDuration()
  const expected = 2000
  expect(actual).toEqual(expected)
})

it("Tests the maximum number of simultaneous rent contract to be 10", () => {
  const actual = getSimultaneousContractLimit()
  const expected = 10
  expect(actual).toEqual(expected)
})
