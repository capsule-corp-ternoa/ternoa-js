import {
  addNftToCollection,
  addSecretToNft,
  burnCollection,
  burnNft,
  closeCollection,
  convertNftToCapsule,
  createCapsule,
  createCollection,
  createNft,
  createSecretNft,
  delegateNft,
  getCapsuleOffchainData,
  getNftData,
  limitCollection,
  notifyEnclaveKeyUpdate,
  //revertCapsule,
  setCapsuleOffchaindata,
  setCollectionOffchaindata,
  setRoyalty,
  transferNft,
} from "."
import { initializeApi } from "../blockchain"
import { WaitUntil } from "../constants"
import { createTestPairs } from "../_misc/testingPairs"

const TEST_DATA = {
  collectionId: 0,
  nftId: 0,
  capsuleId: 0,
}

beforeAll(async () => {
  const endpoint: string | undefined = process.env.BLOCKCHAIN_ENDPOINT
  await initializeApi(endpoint)
})

describe("Testing to create/update/limit a collection", (): void => {
  it("Testing to create a collection", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await createCollection("Collection Test", undefined, testAccount, WaitUntil.BlockInclusion)
    TEST_DATA.collectionId = cEvent.collectionId
    expect(
      cEvent.collectionId > 0 &&
        cEvent.owner === testAccount.address &&
        cEvent.offchainData === "Collection Test" &&
        cEvent.limit === null,
    ).toBe(true)
  })

  it("Testing to update collection offchaindata", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await setCollectionOffchaindata(
      TEST_DATA.collectionId,
      "Collection Test Updated",
      testAccount,
      WaitUntil.BlockInclusion,
    )

    expect(cEvent.collectionId === TEST_DATA.collectionId && cEvent.offchainData === "Collection Test Updated").toBe(
      true,
    )
  })

  it("Testing to limit a collection", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await limitCollection(TEST_DATA.collectionId, 1, testAccount, WaitUntil.BlockInclusion)
    expect(cEvent.collectionId === TEST_DATA.collectionId && cEvent.limit === 1).toBe(true)
  })
})

describe("Testing NFT extrinsics", (): void => {
  it("Testing to create an NFT", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const nEvent = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
    TEST_DATA.nftId = nEvent.nftId
    expect(
      nEvent.nftId > 0 &&
        nEvent.owner === testAccount.address &&
        nEvent.offchainData === "Test NFT Data" &&
        nEvent.royalty === 0 &&
        nEvent.collectionId === null &&
        nEvent.isSoulbound === false,
    ).toBe(true)
  })

  it("Testing to add secret to an NFT", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const nft = await createNft("Test NFT Data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)

    const nEvent = await addSecretToNft(nft.nftId, "Test Secret Data", testAccount, WaitUntil.BlockInclusion)

    expect(nEvent.nftId === nft.nftId && nEvent.offchainData === "Test Secret Data").toBe(true)
  })

  it("Testing to create a Secret NFT", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const nEvent = await createSecretNft(
      "Test NFT Data",
      "Test Secret Data",
      0,
      undefined,
      false,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    expect(
      nEvent.nftId > 0 &&
        nEvent.owner === testAccount.address &&
        nEvent.creator === testAccount.address &&
        nEvent.offchainData === "Test NFT Data" &&
        nEvent.secretOffchainData === "Test Secret Data" &&
        nEvent.royalty === 0 &&
        nEvent.collectionId === null &&
        nEvent.isSoulbound === false,
    ).toBe(true)
  })

  it("Testing to set NFT royalties", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const nEvent = await setRoyalty(TEST_DATA.nftId, 10, testAccount, WaitUntil.BlockInclusion)
    expect(nEvent.nftId === TEST_DATA.nftId && nEvent.royalty === 10).toBe(true)
  })

  it("Testing to add NFT to a collection", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const nEvent = await addNftToCollection(
      TEST_DATA.nftId,
      TEST_DATA.collectionId,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    expect(nEvent.nftId === TEST_DATA.nftId && nEvent.collectionId === TEST_DATA.collectionId).toBe(true)
  })

  it("Testing to delegate an NFT", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const nEvent = await delegateNft(TEST_DATA.nftId, destAccount.address, testAccount, WaitUntil.BlockInclusion)
    expect(nEvent.nftId === TEST_DATA.nftId && nEvent.recipient === destAccount.address).toBe(true)
  })

  it("Testing to undelegate an NFT", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const nEvent = await delegateNft(TEST_DATA.nftId, undefined, testAccount, WaitUntil.BlockInclusion)
    expect(nEvent.nftId === TEST_DATA.nftId && nEvent.recipient === null).toBe(true)
  })

  it("Testing to transfer an NFT", async (): Promise<void> => {
    const { test: testAccount, dest: destAccount } = await createTestPairs()
    const nEvent = await transferNft(TEST_DATA.nftId, destAccount.address, testAccount, WaitUntil.BlockInclusion)
    expect(
      nEvent.nftId === TEST_DATA.nftId &&
        nEvent.sender === testAccount.address &&
        nEvent.recipient === destAccount.address,
    ).toBe(true)
  })

  it("Testing to burn an NFT", async (): Promise<void> => {
    const { dest: destAccount } = await createTestPairs()
    const nEvent = await burnNft(TEST_DATA.nftId, destAccount, WaitUntil.BlockInclusion)
    expect(nEvent.nftId === TEST_DATA.nftId).toBe(true)
  })
})

describe("Testing Capsule NFT extrinsics", (): void => {
  it("Should create a Capsule NFT", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await createCapsule(
      "Test NFT offchain data",
      "Test Capsule NFT offchain data",
      0,
      undefined,
      false,
      testAccount,
      WaitUntil.BlockInclusion,
    )
    TEST_DATA.capsuleId = cEvent.nftId
    expect(
      cEvent.nftId > 0 &&
        cEvent.owner === testAccount.address &&
        cEvent.creator === testAccount.address &&
        cEvent.offchainData === "Test NFT offchain data" &&
        cEvent.capsuleOffchainData === "Test Capsule NFT offchain data" &&
        cEvent.royalty === 0 &&
        cEvent.collectionId === null &&
        cEvent.isSoulbound === false,
    ).toBe(true)
  })
  // xit("Should revert the Capsule part from and NFT", async (): Promise<void> => {
  //   const { test: testAccount } = await createTestPairs()
  //   const cEvent = await revertCapsule(TEST_DATA.capsuleId, testAccount, WaitUntil.BlockInclusion)
  //   const nftData = await getNftData(cEvent.nftId)
  //   expect(nftData?.state.isCapsule).toBe(false)
  // })
  it("Should convert an NFT into a Capsule NFT", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const nEvent = await createNft("Test NFT offchain data", 0, undefined, false, testAccount, WaitUntil.BlockInclusion)
    const cEvent = await convertNftToCapsule(
      nEvent.nftId,
      "Test Capsule NFT offchain data",
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const nftData = await getNftData(cEvent.nftId)
    expect(nftData?.state.isCapsule).toBe(true)
  })
  xit("Should set the Capsule NFT offchain data", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await setCapsuleOffchaindata(
      TEST_DATA.capsuleId,
      "Updated Capsule NFT offchain data",
      testAccount,
      WaitUntil.BlockInclusion,
    )
    const offchainData = await getCapsuleOffchainData(cEvent.nftId)
    expect(offchainData === "Updated Capsule NFT offchain data").toBe(true)
  })
  xit("Should notify the enclave a Capsule NFT key update", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await notifyEnclaveKeyUpdate(TEST_DATA.capsuleId, testAccount, WaitUntil.BlockInclusion)
    const nftData = await getNftData(cEvent.nftId)
    expect(nftData?.state.isSyncingCapsule).toBe(true)
  })
})

describe("Testing to close/burn a collection", (): void => {
  it("Testing to close a collection", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await closeCollection(TEST_DATA.collectionId, testAccount, WaitUntil.BlockInclusion)
    expect(cEvent.collectionId === TEST_DATA.collectionId).toBe(true)
  })

  it("Testing to burn a collection", async (): Promise<void> => {
    const { test: testAccount } = await createTestPairs()
    const cEvent = await burnCollection(TEST_DATA.collectionId, testAccount, WaitUntil.BlockInclusion)
    expect(cEvent.collectionId === TEST_DATA.collectionId).toBe(true)
  })
})
