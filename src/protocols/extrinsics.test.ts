import {
  addConsentToOnConsentProtocol,
  removeTransmissionProtocol,
  resetTransmissionProtocolTimer,
  setTransmissionProtocol,
} from "./extrinsics"
import { initializeApi } from "../blockchain"
import { createTestPairs } from "../_misc/testingPairs"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { ProtocolAction, TransmissionCancellationAction } from "./enums"
import { formatAtBlockWithResetProtocol, formatOnConsentProtocol, formatProtocolCancellation } from "./utils"
import { getLastBlock } from "../helpers/crypto"
const TEST_DATA = {
  nftId: 0,
  transmissionThreshold: 2,
  transmissionBlock: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)

  // Create a Test NFT
  const { test: testAccount } = await createTestPairs()
  const nEvent = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
  TEST_DATA.nftId = nEvent.nftId
})

afterAll(async () => {
  const { test: testAccount } = await createTestPairs()
  await removeTransmissionProtocol(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)
})

describe("Testing transmission protocols extrinsics", (): void => {
  it("Should return the transmission protocol ProtocolSetEvent data", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const lastBlockNumber = await getLastBlock()
    TEST_DATA.transmissionBlock = lastBlockNumber + 100
    const protocol = formatAtBlockWithResetProtocol("atBlockWithReset", TEST_DATA.transmissionBlock)
    const cancellation = formatProtocolCancellation("anytime")
    const tEvent = await setTransmissionProtocol(
      TEST_DATA.nftId,
      destAccount.address,
      protocol,
      cancellation,
      testAccount,
      WaitUntil.BlockInclusion,
    )

    expect(
      tEvent?.nftId === TEST_DATA.nftId &&
        tEvent.recipient == destAccount.address &&
        ProtocolAction.AtBlockWithReset in tEvent.protocol &&
        tEvent.protocol[ProtocolAction.AtBlockWithReset] == TEST_DATA.transmissionBlock &&
        TransmissionCancellationAction.Anytime in tEvent.cancellation &&
        tEvent.cancellation[TransmissionCancellationAction.Anytime] == null,
    ).toBe(true)
  })

  it("Should return the transmission protocol TimerResetEvent data", async () => {
    const { test: testAccount } = await createTestPairs()
    TEST_DATA.transmissionBlock = TEST_DATA.transmissionBlock + 100
    const tEvent = await resetTransmissionProtocolTimer(
      TEST_DATA.nftId,
      TEST_DATA.transmissionBlock,
      testAccount,
      WaitUntil.BlockInclusion,
    )

    expect(tEvent?.nftId === TEST_DATA.nftId && tEvent.newBlockNumber == TEST_DATA.transmissionBlock).toBe(true)
  })

  it("Should return the NFT id of removed protocol", async () => {
    const { test: testAccount } = await createTestPairs()
    const tEvent = await removeTransmissionProtocol(TEST_DATA.nftId, testAccount, WaitUntil.BlockInclusion)

    expect(tEvent?.nftId === TEST_DATA.nftId).toBe(true)
  })

  it("Should return the ConsentAddedEvent data: NFT id and user that gave his consent to a protocol", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const consentList = [destAccount.address, `${process.env.SEED_TEST_FUNDS_PUBLIC}`]
    const protocol = formatOnConsentProtocol("onConsent", consentList, TEST_DATA.transmissionThreshold)
    const cancellation = formatProtocolCancellation("anytime")
    await setTransmissionProtocol(
      TEST_DATA.nftId,
      destAccount.address,
      protocol,
      cancellation,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const tEvent = await addConsentToOnConsentProtocol(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)

    expect(tEvent?.nftId === TEST_DATA.nftId && tEvent.from == destAccount.address).toBe(true)
  })
})
