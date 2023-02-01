import {
  getTransmissionAtBlockFee,
  getTransmissionAtBlockWithResetFee,
  getTransmissionOnConsentAtBlockFee,
  getTransmissionOnConsentFee,
} from "./storage"
import { setTransmissionProtocol } from "./extrinsics"
import { getRawApi, initializeApi } from "../blockchain"
import { createTestPairs } from "../_misc/testingPairs"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { ProtocolAction, TransmissionCancellationAction } from "./enums"

const TEST_DATA = {
  nftId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create a Test NFT
  const { test: testAccount, dest: destAccount } = await createTestPairs()
  const nEvent = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  const api = getRawApi()
  const tEvent = await setTransmissionProtocol(
    nEvent.nftId,
    destAccount.address,
    {
      [ProtocolAction.OnConsent]: {
        consentList: [destAccount.address],
        threshold: 1,
      },
    },
    { [TransmissionCancellationAction.Anytime]: null },
    testAccount,
    WaitUntil.BlockInclusion,
  )
  TEST_DATA.nftId = nEvent.nftId
  console.log(tEvent)
})

describe("Testing to get transmission protocols fee", (): void => {
  it("Transmission protocol At Block fee should exist and it should not be null", async () => {
    const actual = await getTransmissionAtBlockFee()
    expect(actual != undefined).toBe(true)
  })
  it("Transmission protocol At Block With Reset fee should exist and it should not be null", async () => {
    const actual = await getTransmissionAtBlockWithResetFee()
    expect(actual != undefined).toBe(true)
  })
  it("Transmission protocol On Consent fee should exist and it should not be null", async () => {
    const actual = await getTransmissionOnConsentFee()
    expect(actual != undefined).toBe(true)
  })
  it("Transmission protocol On Consent At Block fee should exist and it should not be null", async () => {
    const actual = await getTransmissionOnConsentAtBlockFee()
    expect(actual != undefined).toBe(true)
  })
})
