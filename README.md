# ⚙️ Ternoa SDK

[![ternoajs](https://img.shields.io/badge/ternoa-js-yellow?style=flat-square)](https://ternoa-js.ternoa.dev/)
![license](https://img.shields.io/badge/License-Apache%202.0-blue?logo=apache&style=flat-square)
[![npm stable](https://img.shields.io/npm/v/ternoa-js?logo=npm&style=flat-square)](https://www.npmjs.com/package/ternoa-js)
[![beta](https://img.shields.io/npm/v/ternoa-js/next?label=next-rc&logo=npm&&style=flat-square)](https://www.npmjs.com/package/ternoa-js)

It's the easiest and fastest way to build on top of the Ternoa Chain. Based on Javascript and the Polkadot.js API, it offers developers a seamless experience in the Domain of Web 3.

You can start by familiarizing yourself with the architecture and playing around with the ternoa.js [test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) to get a good grasp of the Ternoa SDK.

Lastly, don’t forget to have a good time, that's like the most important thing. Cheers 🍻

**Table of Contents**

- [Introduction](#introduction)
  - [Contribution Guidelines](#contribution-guidelines)
  - [Error Reporting](#error-reporting)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [On Chain Events](#on-chain-events)
  - [SDK Design](#sdk-design)
    - [Event Design Format](#event-design-format)
    - [Events Handled](#events-handled)
- [Code Architecture](#code-architecture)
  - [Handlers architecture](#handlers-architecture)
    - [Response format](#response-format)
    - [Initialize an API Instance](#initialize-an-api-instance)
  - [Examples](#examples)
    - [Create an Account](#create-an-account)
    - [Create an NFT with Keyring](#create-an-nft-with-keyring)
    - [Create an NFT (full flow)](#create-an-nft-full-flow)
- [Documentation](#documentation)
  - [Wiki](#Wiki)
  - [Typescript documentation](#typescript-documentation)
  - [End-to-end test dApp](#end-to-end-test-dapp)
  - [Github repository](#github-repository)
- [Development](#development)
  - [Build](#build)
  - [Generating Documentation](#generating-documentation)
  - [Testing](#testing)
  - [Code Style](#code-style)
  - [Build And Run With Podman](#build-and-run-with-podman)
    - [Tips to Run with Podman](#tips-to-run-with-podman)
    - [Remove Container After Exit](#remove-container-after-exit)
    - [Persistent Storage](#persistent-storage)
    - [Run The Container And Access Its Shell](#run-the-container-and-access-its-shell)
    - [Create A Detached Instance And Access Its Shell](#create-a-detached-instance-and-access-its-shell)
    - [Create A Development Environment](#create-a-development-environment)
- [License](#license)

## Introduction

Ternoa is a Decentralised, Open source, NFT-centric Layer 1 blockchain that is multi-chain by design and aims to provide a technical stack to build scalable and secure NFTs with native support for advanced features.

#### For Builders By Builders

NFTs native to our chain can be minted using High-level programming languages and doesn't require smart contract functionality.

#### Native support for Advanced Features

With native support for Secret NFTs, Delegating and Lending, Transaction Batching and much more, you might want to give it a try.

#### Ecosystem

Our ecosystem of NFT-based dApps keeps growing day after day. Our SDK relies upon the most popular high-level languages, allowing us to tap into the world’s largest pool of existing developers, thereby minimizing the transition period.

### Contribution Guidelines

As Ternoa-js is an open-source SDK, feel free to interact with the tools and libraries, log issues, create pull requests or leave feedback. We welcome and greatly appreciate your contribution.

If you’re interested in contributing to the Ternoa SDK, we recommend you inspect our [contribution guidelines](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/CONTRIBUTING.md).

If you want to learn how to use the Ternoa SDK, the [test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) is the perfect place to familiarize yourself with our architecture and contribute to its development.

### Error Reporting

If you encounter any errors along the way, technical or otherwise. Let us know and we'll deal with it swiftly.
It'll help us further improve the overall experience for our users.

- Open a discussion of type `General` in the [discussions section](https://github.com/capsule-corp-ternoa/ternoa-js/discussions) if you encounter any unexpected behaviour.
- Open a Bug report using the [bug template](https://github.com/capsule-corp-ternoa/ternoa-js/issues/new/choose) if the bug persists.
- If you can, suggest a fix in a pull request to resolve that issue.

Make sure to document the error properly, keeping in mind that the better you describe it, the easier it is to deal with.

## Installation

Pre-requisites:
[Node.js](https://nodejs.org/en/download/)

Install the latest stable version of the ternoa-js library by running this command:

```bash
npm install ternoa-js
```

> This package provides TypeScript types, but you will need TypeScript version 4.2 or higher to use them properly.

You can test out our upcoming features in our **Beta** `@beta` or **Release candidate** `@rc` versions. These versions aren't stable and might contain some technical errors. @beta versions are for internal and public testing only whereas @rc releases tend to be the closest to its production version.

You can check out our `version list` over @ [npm](https://www.npmjs.com/package/ternoa-js). Installing a specific version is as easy as replacing the 1.2.0-rc0 with your desired version.

```bash
# for version 1.2.0-rc0
npm i ternoa-js@1.2.0-rc0
```

## Quick Start

### On Chain Events

**What are chain events ?**
Events are objects containing decoded values (data) provided by the chain in the result of any transaction executed using the `submitTxBlocking` function. At least one of these two `ExtrinsicSuccessEvent` or `ExtrinsicFailedEvent` events are provided for any transaction depending on its execution. While `submitTxBlocking` provides the SDK handlers with the list of main On Chain events `BlockchainEvents` (alongside the Block information), we also allow you to filter this list to get the ones you need.

An example to filter only the events list of a balance transfer transaction:

```javascript
const balanceTransfertEvents = BlockchainEvents.events.findEvents(BalancesTransferEvent)
```

**Note**: BlockchainEvents is the result of `submitTxBlocking` function: it now contains both block information (block hash, header (...)) and the events list. It can be stored in a constant for example.

### SDK design

To get a better understanding of OnChain Events, we already discussed the option to get the extrinsic events list. In case, you don't need to handle manual signing of transactions, each Ternoa extrinsic features comes with two functions to execute a transaction and an easy one to directly get the required events list. See the example below:

The `balancesTransferTx` function creates an unsigned unsubmitted transaction hash and the `balancesTransfer` function signs and submits the transaction to provide the events list.

**This explains two things:**

1. Each Helper is composed of two functions

- a `xxxxxxxx` version that signs and submits the transaction, then returns the dedicated event.
- a `xxxxxxxxTx` version to create an unsigned and unsubmitted transaction hash.

2. We already cover the most common Ternoa pallets with ready to use pallets. However, all extrinsics can be triggered using a combination of generic blockchain helpers like `createTxHex`,`signTxHex`,`submitTxHex`, etc (check the Handlers Architecture in the next section for more info)

#### Event Design Format

In order to make the returned event data useful, we provide both the native and a friendly ready to use format design:

- a string as an AccountId32 correspond to a classic user valid address.
- a string as u128 is a BN value as string natively used under the hood by the chain.
- a rounded data (ex: amoutRounded) is the "human" version of a data, (usually a BN) that can be directly used.
- some events from the utility pallet do not return any data.

#### Events handled

The events below are the Events handled in the Ternoa SDK sorted by categories

- [Assets](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#assets)
- [Balances](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#balances)
- [Treasury](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#treasury)
- [NFT](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#nft)
- [Collection](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#collection)
- [Marketplace](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#marketplace)
- [Utility](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#utility)
- [System](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#system)

## Code Architecture

Ternoa SDK handles the main features proposed by the Ternoa chain. It allows you to run every transaction from the chain pallet, make a query like asking for some constant's storage. We also provide a bunch of helpers and utility functions to assist you with development.

The main handlers are as follows:

- blockchain: Handles the Core blockchain functions and the API brain initializes the API, execute transactions, query datas, batch transactions and much more.
- account: the functions that allows you to generate a new seed and a keyring.
- assets: the functions to deal with fungible assets that are meant for use within a dApp.
- balance: the Balance pallet with its extrinsics, query and storage.
- nft: the NFT pallet with its extrinsics, query and storage.
- marketplace: the Marketplace pallet with its extrinsics, query and storage.
- events: the events list returned, alongside of block information, when `submitTxBlocking` function is triggered.

### Handlers architecture

For those who are familiar with Polkadot, you will quickly recognize the design structure of our features. If you aren't aware, no worries, the basic principles are easy enough to grasp. Depending on the pallet or handler category, you'll retrive:

- **Constants**: to request the chain runtime constants.
- **Storage**: to query the chain state.
- **Extrinsics**: to execute transactions.
- _Utilities_: to provide some additional useful functions you can directly import in your project.

#### Response format

As it makes sense for us to provide you the easiest tools to build on the Ternoa chain, we also try to simplify the response format of our functions as much as we can.

Depending on if you go with the easy way or choose the complex route (for added customization), we suggest you to choose the right function: Events and features data will be provided directly on some functions while only transaction hash hex will be returned on others.

#### Initialize an API Instance

Before you can start calling any functions, you'll need to initialize an API Instance using the _`initializeApi`_ function located in **ternoa-js/src/blockchain**.

```javascript
import { initializeApi } from "ternoa-js"

async function main() {
  // Construct
  await initializeApi()
  // Do something
  console.log("Api Connected")
}
```

You can set the chain endpoint by passing an endpoint parameter to the _`initializeApi`_ function whereas the default chain endpoint is: `DEFAULT_CHAIN_ENDPOINT` = `"wss://alphanet.ternoa.com"`.

```javascript
{
  // Customizing API Endpoint
  await initializeApi("wss://mainnet.ternoa.io")

  // Do something
  console.log("Api Connected to mainnet")
}
```

Pro Tip: Ternoa SDK provides a very useful `getRawApi()` function to interact with the API. If the API is connected, it'll be returned instantaneously.

```javascript
{
  // Assuming that API has been initialized before
  const api = await getRawApi()

  // example: get last block
  const signedBlock = await api.rpc.chain.getBlock()
}
```

### Examples

#### Create an Account

You can create an account using the API itself. You'll need to call the `generateSeed` and `getKeyringFromSeed` functions.

All functions are organized by a specific theme, for example, the function _generateSeed_ which allows us to create a new account and _getKeyringFromSeed_ which allows us to retrieve its address, can conveniently be found in **ternoa-js/src/account**.

```javascript
import { generateSeed, getKeyringFromSeed } from "ternoa-js/account"
;(async () => {
  const seed = await generateSeed()
  const keyring = await getKeyringFromSeed(seed)
  const address = keyring.address
  console.log("Your fresh public address is: ", address)
})().catch((e) => {
  console.log(e)
})
```

#### Create an NFT with Keyring

Creating a basic NFT using the features provided by the SDK is easy enough. This short snippet of code allows you to Create, Submit and Sign an NFT. Essentially minting your NFT with the click of a button.

The function `createNft` requires a few parameters like: `offchainData` aka metadata, the `royalty` percentage, its `collectionId` if you want it to belong to an existing collection, a Boolean value `isSoulBound` to determine its status, `keyring` parameter to sign and submit the transaction and a callback parameter `waitUntill`, to define when we get the results of that transaction execution.

```javascript
// The easiest way to Create your first NFT
import { initializeApi } from "ternoa-js"
import { createNft } from "ternoa-js/nft"

const createMyFirstNFT = async () => {
  try {
    // We initialize the API instance
    await initializeApi()

    ... //we asume your keyring is already created and provided with CAPS to support transactions fees.

    // Here we create, sign and submit the NFT transaction with your keyring
    const newNFTEvent = await createNft("My first NFT", 10, undefined, false, keyring, WaitUntil.BlockInclusion)

    // Do something with the NFTCreatedEvent response
    console.log(newNFTEvent);
    ...

  } catch (e) {
    console.log(e)
  }
}
```

#### Create an NFT (full flow)

**That being said, You can opt for the manual route which although being complex, offers more versatility.**

The Simple way automated the 3 steps (Create -> Sign => Send) associated with creating an NFT making it much easier to use while not allowing any room for customisation and optimisation.

The manual way provides much more versatility but is significantly more complex. Let's say for example you want to batch transactions together instead of executing them one by one (covered in example section). It'll be useful if you want to simplify the process of creating a large amount of NFTs and minimize repetitive tasks like sending and signing each transaction.

##### STEP 1 - Create an NFT transaction

First of all, instead of using the `createNft()` function, you will use `createNftTx()`. And instead of creating, signing and submiting the transaction and getting the returned events, it will just create an unsigned and unsubmitted Create-NFT Transaction Hash which will be _valid for the next 5 minutes_.

```javascript
// Imports
import { initializeApi } from "ternoa-js"
import { createNftTx } from "ternoa-js/nft"

const create createNFTManually = async () => {
  try {
    // STEP 1: Here we create the transaction and get the transaction hash
    const nftTxHash = await createNftTx("My first NFT", 10, undefined, false)

    // Do something with the transaction hash
    console.log(nftTxHash);
  } catch (e) {
    console.log(e)
  }
}
```

##### STEP 2 - Sign a transaction hash

Now we have the `txHash`, we can move to the signing step. But before going into detail, it's good to know that "signing" can be directly embed in the submit function. It means that depending on the submit function you are using (see the last step below), signing your tx hash before submit might not be necessary. In case you sign manually the tx hash, you will receive a hex value of the signed transaction ready to be sent. The `signTxHex()` function expect **a keyring** that will sign the transaction and the **transaction hash** to be signed.

```javascript
const create createNFTManually = async () => {
  try {
  // STEP 2: Here we sign the transaction hash. nftTxHash is the name of the tx hash from the function we created before.
    const signTxHash = await signTxHex(keyring, nftTxHash)
    // Do something with the hex value.
    console.log(signTxHash);
  } catch (e) {
    console.log(e)
  }
}
```

##### STEP 3 - Submit a transaction

Submiting a transaction is generally the last step of the transaction execussion process. Ternoa-js provides up to 3 ways to submit a transaction. From the raw and native way to the fully handled and easiest way. Depending on the response format you are expecting and the specific case you want to handle (simple submit, batching some transaction (...)) you will need to go with one of the following functions:

- `submitTxHex()` - The most versatile and customizable way to submit your `txHash`. You can manage the callback function yourself. It requires the hex value to be submited but also an optional callback. This function requires the transaction hash to be signed beforehand.

```javascript
const create createNFTManually = async () => {
  try {
    // STEP 3.1: Here we submit the transaction hex value.
    // Here no callback function is used but the second parameter can be a callback function that help you to handle the result.
    // Once again, we use here the tx hex signedTxHash, from the previous step.
    const submitTxHash = await submitTxHex(signTxHash)
    // Do something with the final tx hash.
    console.log(submitTxHash);
  } catch (e) {
    console.log(e)
  }
}
```

- `submitTxBlocking()` - The most most convenient way to get Events and Data: This function will sign the transaction for you if you pass a keyring (one less thing to worry about) and it's blocking the execution flow until the transaction is either in a block or in a finalized block. Since submitting needs to work will all kinds of transactions, the result is an object that contains the block information (the block hash, the block header and block extrinsics) and all the events that have happened (instead of only specific ones).

Note: Here you do not need to necessarily pass a signed txHash. If you pass the Keyring as a parameter and an unsigned tx hash the signing process will be done here for you.

```javascript
const create createNFTManually = async () => {
  try {
    ...

    // STEP 3.2: Here we submit the transaction hex value signed before.
    // We could have used the unsigned tx Hash and pass a keyring as a third parameter instead.
    // Once again, we use here the tx hex signTxHash, from the previous step.
    const submitTxHash = await submitTxBlocking(signTxHash, WaitUntil.BlockInclusion)
    // We destructure the result of submitTxHash:
    const { events, blockInfo } = submitTxHash
    // Do something with the events recieved. Example: find the NFTCreatedEvent to access the NFT datas.
    console.log(events.findEvents(NFTCreatedEvent));
    ...
  } catch (e) {
    console.log(e)
  }
}
```

- `submitTxNonBlocking()`: This one works as the `submitTxBlocking` but in a non blocking way. Returns a group objects that are used to track the progress of the transaction execution: The first returned object is a conditional variable which can yield the information if the operation is finished. The second returned object is an array of events which gets populated automatically once the operation is finished. The third returned object contains the block information as the block hash, the block header and block extrinsics.

```javascript
const create createNFTManually = async () => {
  try {
    ...

    // STEP 3.3: It get the same parameters as the submitTxBlocking
    // Here we submit the transaction hex value signed before.
    // We could have used the unsigned tx Hash and pass a keyring as a third parameter instead.
    // Once again, we use here the tx hex signTxHash, from the previous step 2.
    const submitTxHash = await submitTxNonBlocking(signTxHash, WaitUntil.BlockInclusion)

    // Do something with the events recieved.
    console.log(submitTxHash);
    ...
  } catch (e) {
    console.log(e)
  }
}
```

## Documentation

### Wiki

Check out our [Wiki](https://github.com/capsule-corp-ternoa/chain/wiki) page. We are constantly adding new pages and guides there.

### Typescript documentation

The auto generated typescript documentation is available @[Dev.Ternoa](https://ternoa-js.ternoa.dev/) and any additional resources can be found over @[Docs.Ternoa](https://docs.ternoa.network/),

### End-to-end test dApp

Discover our end-to-end test Dapp [here](https://e2e.ternoa.network/) to test out the Ternoa SDK.
Here's the E2E-test-dapp repository -> [repo](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp)

### Github repository

Here's the Ternoa.js SDK Github repository -> [repo](https://github.com/capsule-corp-ternoa/ternoa-js)

## Development

### Build

To build a new version of the library, run:

```bash
npm run build
```

### Generating Documentation

To generate the documentation website, run:

```bash
npm run docs
```

You can locate the static website in the [/docs](https://github.com/capsule-corp-ternoa/ternoa-js/tree/main/docs) directory.

### Testing

The test suites rely upon testing pairs in the [testing pairs file](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/testingPairs.ts). In order to prepare these pairs, [test-setup.ts](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/scripts/test-setup.ts) and [test-teardown.ts](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/scripts/test-teardown.ts) are supplied and drained of `$CAPS` respectively. Environmental variables `BLOCKCHAIN_ENDPOINT` (e.g. `BLOCKCHAIN_ENDPOINT=wss://alphanet.ternoa.com`), `SEED_TEST_FUNDS` and `SEED_TEST_FUNDS_PUBLIC_KEY` have to be defined in order to run these test suites.

To initiate the test suites, run:

```bash
npm run test
```

### Code Style

This project uses Industry standard ESLint and Typescript rules to ensure good coding practices and readability.

We’ve set up linters and formatters to help catch errors and enhance the overall experience:

- [Prettier](https://prettier.io/) – ensures that code is formatted in a readable way.
- [ESLint](https://eslint.org/) — checks code for antipatterns as well as formatting.

> If you use Visual Studio Code editor, we suggest you to install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.

### Build And Run With Podman

```bash
  # Downloads the package lists and "updates" them.S
  sudo apt update -y
  # Installing podman.
  sudo apt install podman
  # Building the image using podman and Docker file.
  podman build -t tsdk .
  # Checking if everything is OK.
  podman images | grep tsdk
  # Run the tsk image.
  podman run tsdk
```

#### Tips to Run with Podman

We’ll illustrate some useful podman commands and their use cases next. It’s important to note that we’ve omitted most of the flags to make them concise. Make sure to build the image as per the steps defined in the "Build and Run with Podman" section.

In case no command arguments are specified, It’ll try to build the `starter-project` by default. To override this, simply add `bash` at the end of the command. It'll look something like: `podman run tsdk bash`.

#### Remove Container After Exit

A container which completed its execution or is no longer in use due to the user disconnecting will not be removed by default, it’ll switch to the exit state.

Use the flag `--rm` to make sure it’s deleted and later removed.

```bash
  # The --rm flag removes the container after usage.
  podman run --rm tsdk
  # Check if any container is running or stopped.
  podman ps -a
```

#### Persistent Storage

The container uses a local copy of the repo in order to compile and run examples. This means that if changes are made inside the container, they’ll fail to propagate and will be lost. To mitigate this issue, the virtual container volume `/workdir` needs to be mapped to a directory on the host machine that contains the Ternoa.js repo. After the mapping is done, any changes made in the mapped directory will be reflected in the container.

This way, you can develop dApps without having to install all the required dependencies. For the workflow check out the "Create A Development Environment" section.

```bash
  # Flag -v tells the host machine to map the physical "./." path with the virtual container one "/workdir". If no command arguments are given this will try to compile and run the starter-project project.
  podman run -v ./.:/workdir tsdk
```

#### Run The Container And Access Its Shell

The pre defined operation of the container when executed is to compile and and initiate the `starter-project`. To execute a different operation, additional commands can be passed at the end. For example: padding `bash` will run the bash shell session instead of the default operation.

```bash
  # If no command arguments are given this will try to compile and run the starter-project. By passing "bash" we make sure that we run a bash shell session once the container starts.
  podman run -it tsdk bash
```

#### Create A Detached Instance And Access Its Shell

```bash
  # Flag "-d" runs the container in detached mode.
  podman run -d tsdk bash
  # Access its shell.
  podman exec -itl bash
```

#### Create A Development Environment

The dockerfile is made in a way that it can be used to develop new applications with it.

Example of a typical workflow:

- The host installs git, clones the repo and install a code editor like VS Code.
- runs the container in interactive mode with `/workdir` pointing to a work directory on the host machine (can be your own project or ternoa-js).
- writes code via a code editor and uses the terminal to run the `tsc` and `node` commands.
- With that setup all the changes are done locally on the host machine while the container is only used to compile and run the app.

```bash
  # Flag "--name" is used to name the container.
  podman run -it --name my_sdk_env -v ./.:/workdir tsdk bash
  # Do some activity and the exit the container
  [root@d4ad8ec11655:/workdir] nano -V
  [root@d4ad8ec11655:/workdir] apt install nano
  [root@d4ad8ec11655:/workdir] exit

  # Return to the same container
  podman start my_sdk_env
  podman exec -it my_sdk_env /bin/bash
  [root@d4ad8ec11655:/workdir] nano -V
```

## License

Ternoa.js uses the [Apache 2.0](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/LICENSE) License.
