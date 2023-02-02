import {
  addConsentToOnConsentProtocol,
  removeTransmissionProtocol,
  resetTranmissionProtocolTimer,
  setTransmissionProtocol,
} from "./extrinsics"
import { getRawApi, initializeApi } from "../blockchain"
import { createTestPairs } from "../_misc/testingPairs"
import { WaitUntil } from "../constants"
import { createNft } from "../nft"
import { ProtocolAction, TransmissionCancellationAction } from "./enums"
import { getTransmissionOnConsentData } from "."

const TEST_DATA = {
  nftId: 0,
  transmissonThreshold: 2,
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
    const api = getRawApi()
    const lastBlockData = await api.rpc.chain.getBlock()
    const lastBlockNumber = Number(lastBlockData.block.header.number.toString())
    TEST_DATA.transmissionBlock = lastBlockNumber + 100
    const tEvent = await setTransmissionProtocol(
      TEST_DATA.nftId,
      destAccount.address,
      {
        [ProtocolAction.AtBlockWithReset]: TEST_DATA.transmissionBlock,
      },
      { [TransmissionCancellationAction.Anytime]: null },
      testAccount,
      WaitUntil.BlockInclusion,
    )

    expect(
      tEvent?.nftId === TEST_DATA.nftId &&
        tEvent.recipient == destAccount.address &&
        tEvent.protocol[ProtocolAction.AtBlockWithReset] == TEST_DATA.transmissionBlock &&
        tEvent.cancellation[TransmissionCancellationAction.Anytime] == null,
    ).toBe(true)
  })

  it("Should return the transmission protocol TimerResetEvent data", async () => {
    const { test: testAccount } = await createTestPairs()
    TEST_DATA.transmissionBlock = TEST_DATA.transmissionBlock + 100
    const tEvent = await resetTranmissionProtocolTimer(
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

  // addConsentToOnConsentProtocol : set Transmission on consent
  it("Should return the ConsentAddedEvent data: NFT id and user that gave his consent to a protocol", async () => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    await setTransmissionProtocol(
      TEST_DATA.nftId,
      destAccount.address,
      {
        [ProtocolAction.OnConsent]: {
          consentList: [destAccount.address, `${process.env.SEED_TEST_FUNDS_PUBLIC}`],
          threshold: TEST_DATA.transmissonThreshold,
        },
      },
      { [TransmissionCancellationAction.Anytime]: null },
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const tEvent = await addConsentToOnConsentProtocol(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)

    expect(tEvent?.nftId === TEST_DATA.nftId && tEvent.from == destAccount.address).toBe(true)
  })
})
