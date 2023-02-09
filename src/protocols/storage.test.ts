import {
  getTransmissionAtBlockFee,
  getTransmissionAtBlockQueue,
  getTransmissionAtBlockWithResetFee,
  getTransmissionOnConsentAtBlockFee,
  getTransmissionOnConsentData,
  getTransmissionOnConsentFee,
  getTransmissions,
} from "./storage"
import { formatAtBlockProtocol, formatOnConsentAtBlockProtocol, formatProtocolCancellation } from "./utils"
import { addConsentToOnConsentProtocol, removeTransmissionProtocol, setTransmissionProtocol } from "./extrinsics"
import { getRawApi, initializeApi } from "../blockchain"
import { createTestPairs } from "../_misc/testingPairs"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { ProtocolAction, TransmissionCancellationAction } from "./enums"
import { getLastBlock } from "../helpers/crypto"

const TEST_DATA = {
  nftId: 0,
  transmissonThreshold: 2,
  transmissionBlock: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create a Test NFT
  const { test: testAccount, dest: destAccount } = await createTestPairs()
  const nEvent = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  const lastBlockNumber = await getLastBlock()
  TEST_DATA.transmissionBlock = lastBlockNumber + 100
  const consentList = [destAccount.address, `${process.env.SEED_TEST_FUNDS_PUBLIC}`]
  const protocol = formatOnConsentAtBlockProtocol(
    "onConsentAtBlock",
    consentList,
    TEST_DATA.transmissonThreshold,
    TEST_DATA.transmissionBlock,
  )
  const cancellation = formatProtocolCancellation("anytime")
  await setTransmissionProtocol(
    nEvent.nftId,
    destAccount.address,
    protocol,
    cancellation,
    testAccount,
    WaitUntil.BlockInclusion,
  )
  TEST_DATA.nftId = nEvent.nftId
})

afterAll(async () => {
  const { test: testAccount } = await createTestPairs()
  await removeTransmissionProtocol(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)
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

describe("Testing to get transmission protocols data", (): void => {
  it("Should return the transmission protocol data", async () => {
    const { dest: destAccount } = await createTestPairs()
    const data = await getTransmissions(TEST_DATA.nftId)
    expect(
      data?.recipient == destAccount.address &&
        data.protocol[ProtocolAction.OnConsentAtBlock].consentList.length == 2 &&
        data.protocol[ProtocolAction.OnConsentAtBlock].threshold == TEST_DATA.transmissonThreshold &&
        data.protocol[ProtocolAction.OnConsentAtBlock].block == TEST_DATA.transmissionBlock &&
        data.cancellation[TransmissionCancellationAction.Anytime] == null,
    ).toBe(true)
  })
  it("Should return the list of address that gave their consent to the OnConsentAtBlock transmission protocol.", async () => {
    const { dest: destAccount } = await createTestPairs()
    await addConsentToOnConsentProtocol(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    const list = await getTransmissionOnConsentData(TEST_DATA.nftId)
    expect(list[0] == destAccount.address).toBe(true)
  })
  it("Transmission protocol At Block fee should exist and it should not be null", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await removeTransmissionProtocol(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)
    const protocol = formatAtBlockProtocol("atBlock", TEST_DATA.transmissionBlock)
    const cancellation = formatProtocolCancellation("anytime")
    await setTransmissionProtocol(
      TEST_DATA.nftId,
      destAccount.address,
      protocol,
      cancellation,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const data = await getTransmissionAtBlockQueue()
    const idx = data.length - 1
    expect(data[idx].nftId == TEST_DATA.nftId && data[idx].blockNumber == TEST_DATA.transmissionBlock).toBe(true)
  })
})
