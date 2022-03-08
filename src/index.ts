import { generateSeed, getKeyringFromSeed } from "./account"

const testt = async () => {
  const account = await generateSeed()
  console.log(account)
  const keyring = await getKeyringFromSeed(account.seed)
  console.log(keyring)
}
testt()

export * from "./account"
