import BN from "bn.js"

export type Balances = {
    free: BN,
    reserved: BN,
    frozen?: BN,
    flags?: BN,
    miscFrozen?: BN,
    feeFrozen?: BN,
}
