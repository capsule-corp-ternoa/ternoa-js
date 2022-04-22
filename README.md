# ⚙️ Ternoa SDK

[![npm version](https://badge.fury.io/js/ternoa-js.svg)](https://badge.fury.io/js/ternoa-js)

The easiest and fastest way to build on top of Ternoa Chain.

## Installation

### [Node.js](https://nodejs.org/en/download/)

```bash
npm install ternoa-js
```

<!---
Specify the typescript version required
Suggest webpack/vite/react error fixing approach
-->

## Quick Start

Functions are organized by theme. In the exemple below, the import of _generateSeed_ and _getKeyringFromSeed_ from the subpath **ternoa-js/account** allows us to generate a new account and display its address.

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

The default chain endpoint is: `DEFAULT_CHAIN_ENDPOINT = "wss://chain-dev-latest.ternoa.dev"`.
It can be modified by passing a new endpoint as a parameter to the _initializeApi_ function in **ternoa-js/blockchain**.

## Documentation

The official SDK documentation is available: [ternoa-js sdk documentation](http://ternoa-js-doc.ternoa.dev). Additional resources are available on the [ternoa official documentation](https://ternoa-doc.netlify.app/).

<!---
### Cookbook examples
-->

## SDK Development

### Building

To build a new version of the library, run:

```bash
$ npm run build
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
