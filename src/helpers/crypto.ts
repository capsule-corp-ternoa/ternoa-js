import { IKeyringPair } from "@polkadot/types/types"
import { SignerResult, Signer } from "@polkadot/api/types"
import { u8aToHex } from "@polkadot/util"
import { getRawApi } from "../blockchain"
import { Buffer } from "buffer"

/**
 * @name getSignatureFromKeyring
 * @summary         Signs data using the keyring.
 * @param keyring   Account that will sign the data.
 * @param data      Data to be signed.
 * @returns         Hex value of the signed data.
 */
export const getSignatureFromKeyring = (keyring: IKeyringPair, data: string) => {
  const finalData = new Uint8Array(Buffer.from(data))
  return u8aToHex(keyring.sign(finalData))
}

/**
 * @name getSignatureFromExtension
 * @summary                 Signs data using an injector extension. We recommand Polkadot extention.
 * @param signerAddress     Account address that will sign the data.
 * @param injectorExtension The signer method retrived from your extension: object must have a signer key.
 * @param data              Data to be signed.
 * @returns                 Hex value of the signed data.
 */
export const getSignatureFromExtension = async (
  signerAddress: string,
  injectorExtension: Record<string, Signer | any>,
  data: string,
) => {
  // To handle Polkadot Extension
  if (injectorExtension && "signer" in injectorExtension && injectorExtension?.signer?.signRaw) {
    const { signature } = (await injectorExtension?.signer?.signRaw({
      address: signerAddress,
      data,
      type: "payload",
    })) as SignerResult
    return signature
  }
  // To handle signing from Api
  else if (injectorExtension && "signer" in injectorExtension) {
    const api = getRawApi()
    return await api.sign(
      signerAddress,
      {
        data: data,
      },
      { signer: injectorExtension.signer },
    )
  }
}

/**
 * @name getLastBlock
 * @summary         Retrieve the last block number.
 * @returns         The last Block id (a number).
 */
export const getLastBlock = async () => {
  const api = getRawApi()
  const lastBlockHash = await api.rpc.chain.getFinalizedHead()
  const lastBlock = await api.rpc.chain.getBlock(lastBlockHash)
  const lastBlockId = Number(lastBlock.block.header.number.toString())
  return lastBlockId
}
