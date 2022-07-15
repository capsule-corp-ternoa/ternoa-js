import { initializeApi, numberToBalance } from "../blockchain"
import { WaitUntil } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"
import { balancesTransfer, balancesTransferKeepAlive } from "./extrinsics"

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)
})

describe("Testing balance transfers", (): void => {
  it("Transfer 1 CAPS from the testing account", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const oneCapsAmount = await numberToBalance(1)
    const event = await balancesTransfer(destAccount.address, oneCapsAmount, testAccount, WaitUntil.BlockInclusion)
    expect(
      event.from === testAccount.address &&
        event.to === destAccount.address &&
        event.amount === oneCapsAmount.toString(),
    ).toBe(true)
  })

  it("Transfer 1 CAPS from the testing account using balancesTransferKeepAlive", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const oneCapsAmount = await numberToBalance(1)
    const event = await balancesTransferKeepAlive(
      destAccount.address,
      oneCapsAmount,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    expect(
      event.from === testAccount.address &&
        event.to === destAccount.address &&
        event.amount === oneCapsAmount.toString(),
    ).toBe(true)
  })
})
