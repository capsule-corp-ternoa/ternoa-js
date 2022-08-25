import BN from "bn.js"

import { balanceToNumber } from "./blockchain"

export const roundBalance = (amount: string) =>
  Number(balanceToNumber(new BN(amount), { forceUnit: "-", withUnit: false }).split(",").join(""))
