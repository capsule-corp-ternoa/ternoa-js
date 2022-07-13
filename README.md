# ⚙️ Ternoa SDK

[![npm version](https://badge.fury.io/js/ternoa-js.svg)](https://badge.fury.io/js/ternoa-js)

The easiest and fastest way to build on top of Ternoa Chain.

## Installation

### [Node.js](https://nodejs.org/en/download/)

```bash
npm install ternoa-js
```

> This package provides TypeScript types, but you will need TypeScript version 4.2 or higher to use them properly.

## Quick Start

The default chain endpoint is: `DEFAULT_CHAIN_ENDPOINT = "wss://alphanet.ternoa.com"`.
It can be modified by passing a new endpoint as a parameter to the _initializeApi_ function in **ternoa-js/blockchain**.

It's not strictly necessary to initialize the internal SDK API but it's good practice to do it as soon as possible. Otherwise, the API will be forcefully initialized in the first SDK call.

Functions are organized by theme. In the example below, the import of _generateSeed_ and _getKeyringFromSeed_ from the subpath **ternoa-js/account** allows us to generate a new account and display its address.

```javascript
import { generateSeed, getKeyringFromSeed } from "ternoa-js/account"
;(async () => {
  const account = await generateSeed()
  const keyring = await getKeyringFromSeed(account.seed)
  const address = keyring.address
  console.log("Your fresh public address is: ", address)
})().catch((e) => {
  console.log(e)
})
```

Among all the features provided by the Ternoa SDK, this short snippet of code allows you to create an NFT, submit and sign it at a glance. This single line _createNft_ function, require a few parameters : some `offchainData` metadatas, a `royalty`, a `collectionId` if you want this NFT to belong to a collection, a boolean to define its `isSoulbound` status, the `keyring` to sign and submit the transaction, and a `waitUntil` callback parameter, to define at which point we want to get the results of the transaction execution.

```javascript
import { createNft } from "ternoa-js/nft"
import { generateSeed, getKeyringFromSeed } from "ternoa-js/account"

const createMyFirstNFT = async () => {
  try {
    // we will need a keyring to sing and submit the transaction
    const account = await generateSeed()
    const keyring = await getKeyringFromSeed(account.seed)

    // Here we create, sing and submit the transaction
    await createNft("My first NFT", 10, 1, false, keyring, WaitUntil.BlockInclusion)
  } catch (e) {
    console.log(e)
  }
}
```

## Documentation

The official SDK documentation is available: [ternoa-js sdk documentation](http://ternoa-js.ternoa.dev). Additional resources are available on the [ternoa official documentation](https://docs.ternoa.network/).

Discover our End-to-End Test DApp here and create your first NFT using our testing DApp: [ternoa-js-test-dapp](https://e2e.ternoa.network/).

### Cookbook example

If you are looking for a quick overview about the basic-usage of the Ternoa SDK, some explications or the best-practices, and how to create your first NFT, we recommand you to look at the exemple section [cookbook/basic-usage](https://github.com/capsule-corp-ternoa/ternoa-js/tree/1.1.0-basicNFTs-collections/examples/cookbook/basic-usage)

## SDK Development

### Building

To build a new version of the library, run:

```bash
npm run build
```

### Generating Documentation

To generate the documentation website, run:

```bash
npm run docs
```

The static website will be located in the [docs/](https://github.com/capsule-corp-ternoa/ternoa-js/tree/main/docs) directory.

### Testing

The test suites relies on testing pairs located in the [testingPairs.ts](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/testingPairs.ts) file. In order to prepare those pairs, the two scripts [test-setup.ts](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/scripts/test-setup.ts) and [test-teardown.ts](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/scripts/test-teardown.ts) respectively fulfilled and emptied them with CAPS. Environment variables `SEED_TEST_FUNDS` and `SEED_TEST_FUNDS_PUBLIC_KEY` have to be define to run the test suites.

To run the test suites, run:

```bash
npm run test
```

### Code Style

This project uses recommended ESLint and Typescript rules to ensure coding good practices.

We've setup linters and formatters to help catch errors and improve the development experience:

- [Prettier](https://prettier.io/) – ensures that code is formatted in a readable way.
- [ESLint](https://eslint.org/) — checks code for antipatterns as well as formatting.

[Husky](https://typicode.github.io/husky) proceeds some checks before pushing a new commit. It ensures that: the project is building, there are no linter/formatting issues and the test suites are not broken.

> If you use Visual Studio Code editor we suggest you to install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.

## License

ternoa-js uses an [Apache-2.0 License](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/LICENSE).
