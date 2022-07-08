import BN from "bn.js"
import { consts } from "../blockchain"
import { Balance, chainConstants, Errors, txPallets } from "../constants"
import { getFreeBalance } from "../balance"

/**
 * @name getInitialMintFee
 * @summary Original mint fee.
 * @returns Original NFT mint fee.
 */
export const getInitialMintFee = async (): Promise<Balance> => {
    const fee: any = await consts(txPallets.nft, chainConstants.initialMintFee);
    return fee as Balance;
}

/**
 * @name getCollectionSizeLimit
 * @summary Maximum collection length.
 * @returns Number.
 */
export const getCollectionSizeLimit = async (): Promise<number> => {
    const limit = await consts(txPallets.nft, chainConstants.collectionSizeLimit);
    return (limit as any as BN).toNumber();
}

/**
 * @name getNftOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getNftOffchainDataLimit = async (): Promise<number> => {
    const limit = await consts(txPallets.nft, chainConstants.nftOffchainDataLimit)
    return (limit as any as BN).toNumber();
}

/**
 * @name getCollectionOffchainDataLimit
 * @summary Provides the maximum offchain data length.
 * @returns Number.
 */
export const getCollectionOffchainDataLimit = async (): Promise<number> => {
    const limit: any = await consts(txPallets.nft, chainConstants.collectionOffchainDataLimit)
    return limit as number
}

// Misc
/**
 * @name checkBalanceToMintNft
 * @summary Checks if an account as enough funds to support the NFT mint fee.
 * @param address Public address of the account to check balance to mint an NFT.
 */
export const checkBalanceToMintNft = async (address: string): Promise<void> => {
    const freeBalance = await getFreeBalance(address)
    const nftMintFee = await getInitialMintFee()
    if (freeBalance.cmp(nftMintFee) === -1) throw new Error(Errors.INSUFFICIENT_FUNDS)
}

/**
 * @name checkNftOffchainDataLimit
 * @summary Checks if the nftOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkNftOffchainDataLimit = async (offchainLength: number): Promise<void> => {
    const limit = await getNftOffchainDataLimit()
    if (offchainLength > limit) throw new Error(Errors.OFFCHAIN_LENGTH_TOO_HIGH)
}

/**
 * @name checkCollectionOffchainDataLimit
 * @summary Checks if the collectionOffchain data length is lower than maximum authorized length.
 * @param offchainLength Offchain data length.
 */
export const checkCollectionOffchainDataLimit = async (offchainLength: number): Promise<void> => {
    const limit = await getCollectionOffchainDataLimit()
    if (offchainLength > limit) throw new Error(Errors.OFFCHAIN_LENGTH_TOO_HIGH)
}

/**
 * @name checkCollectionSizeLimit
 * @summary Checks if the collection limit is lower than maximum limit.
 * @param limit Collection limit.
 */
export const checkCollectionSizeLimit = async (limit: number): Promise<void> => {
    if (limit <= 0) throw new Error(Errors.LIMIT_TOO_LOW)
    const collectionLimit = await getCollectionSizeLimit()
    if (limit > collectionLimit) throw new Error(Errors.LIMIT_TOO_HIGH)
}
