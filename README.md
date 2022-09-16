# 🤔 Introduction

Ternoa is a Decentralised, Open source, NFT-centric Layer 1 blockchain that is multi-chain by design and aims to provide a technical stack to build scalable and secure NFTs with native support for advanced features.

For Builders By Builders :

NFTs native to our chain can be deployed using High-level programming languages and does not require smart contract functionality.

Privacy, A Fundamental Right :

Ternoa combines the decentralization aspect with native encryption using Trusted execution environment, turning NFTs into secure, private Data containers, allowing users to retain "True Ownership" of Digital Data.

Sustainability is Key :

Our protocol relies upon Nominated Proof-Of-Stake ensuring state-of-the-art energy consumption. Sustainalbility is one of the key aspects on which mass adoption of blockchain tech depends.

Multi Chain By Design :

Using mirroring, bridges, and native Polkadot functionality, Ternoa allows users to merge NFTs from all ecosystems in a single place and enjoy the benefits of our tech stack.

Native support for Advanced Features :

With native support for Secret NFTs, Mirroring, Delegating and Lending, Combination and Fractionalization of NFTs, and much more, you might want to give it a try.

##### Ecosystem 
Our ecosystem of NFT based dApps keep growing day after day. Our SDK relies upon the most popular high level languages, allowing us to tap into the world’s largest pool of developers so the Transition period for that is Minimized.

The Labs helps entrepreneurs to start building on Ternoa network with zero code experience courtesy of Our leading Developers who gather the best dev, product and strategy teams.

### Contribution Guidelines :

Ternoa.js is an open-source SDK, feel free to interact with the tools and libraries, log issues, create pull requests or leave feedback. We welcome and (greatly) appreciate your contribution (towards the ecosystem).

If you’re interested in contributing to the Ternoa SDK, we recommend you check out our [contribution guidelines](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/CONTRIBUTING.md).

If you want to learn how to use the Ternoa SDK, the [test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) is the perfect place for you to start, that way you can familiarize yourself with our architecture and contribute to the ecosystem's development.

### Error Reporting :
If you encounter any errors along the way, technical or otherwise. Let us know and we'll deal with it swiftly. It helps us to further improve the experience for our users. We sincerely appreciate each one of you for all of your contribution.

You could reach out to us either via any of our social handles, in github comments or by email. Make sure to document the error properly and keep it concise. Keeping in mind, the better you descibe it, the easier it is to deal with.

# ⚙️ Ternoa SDK

[![npm version](https://badge.fury.io/js/ternoa-js.svg)](https://badge.fury.io/js/ternoa-js)

It's the easiest and fastest way to build on top of the Ternoa Chain. It's based on the Polkadot.js API and Javascript, that way it offers developers a seamless experience into the Web 3 Domain.

You can start by familiarizing yourself with the architecture and playing around with the ternoa.js [test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) to get a good grasp of the Ternoa SDK.

Lastly, don’t forget to have a good time, that's like the most important thing. Cheers 🍻

## Installation :

Pre-requisites :
[Node.js](https://nodejs.org/en/download/) 

Install the latest stable version of the ternoa-js library by running this command :

```bash
npm install ternoa-js
```

> This package provides TypeScript types, but you will need TypeScript version 4.2 or higher to use them properly.

You can test out our upcoming features in our **Beta** `@beta` or **Release candidate** `@rc` versions. These versions aren't stable and might contain some technical errors. @beta versions are for internal and public testing only whereas @rc releases tend to be the closest to its production version.

You can check out the list of our versions over @ [npm](https://www.npmjs.com/package/ternoa-js). Installing a specific version is as easy as replacing the 1.2.0-rc0 with your desired version.

```bash
# for version 1.2.0-rc0 
npm i ternoa-js@1.2.0-rc0
```

## Quick Start

### OnChain Events
**What are chain events ?**
Events are objects containing decoded values (data) provided by the chain in the result of any transaction executed using the `submitTxBlocking` function. At least one of these two `ExtrinsicSuccessEvent` or `ExtrinsicFailedEvent` events are provided for any transaction depending on its execution. While `submitTxBlocking` provides the SDK handlers with the list of main OnChain events **BlockchainEvents**, we also allow you to filter this list to get the ones you need.

An example to filter only the events list of a balance transfer transaction :

```javascript
const balanceTransfertEvents = BlockchainEvents.findEvents(BalancesTransferEvent)
```
**Note** : BlockchainEvents is the result of `submitTxBlocking` function. It can be stored in a constant for example.

To get a better understanding of OnChain Events, we already discussed the option to get the extrinsic events list. In case, you doo't need to handle manual signing of transactions, each Ternoa extrinsic features comes with two functions to execute a transaction and an easy one to directly get the required events list. See the example below :

When the `balancesTransferTx` function creates an unsigned unsubmitted transaction hash, the `balancesTransfer` function signs and submits the transaction to provide the events list.

#### About the Event Design Format:
In order to make the returned event data useful, we provide both the native and a friendly ready to use format design :
+ a string as an AccountId32 correspond to a classic user valid address.
+ a string as u128 is a BN value as string natively used under the hood by the chain.
+ a rounded data (ex: amoutRounded) is the "human" version of a data, (usually a BN) that can be directly used.
+ some events from the utility pallet do not return any data.

#### The events below are the Events handled in the Ternoa SDK sorted by categories

+ [Balances](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#balances)
+ [Treasury](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#treasury)
+ [NFT](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#nft)
+ [Collection](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#collection)
+ [Marketplace](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#marketplace)
+ [Utility](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#utility)
+ [System](https://github.com/capsule-corp-ternoa/ternoa-js/wiki/4-Events#system)

#### Initialize an API Instance
Before you can start calling any functions, you'll need to initialize an API Instance using the _`initializeApi`_ function located in **ternoa-js/src/blockchain**.
```javascript
import { initializeApi } from "ternoa-js"

async function main() {
  // Construct
  await initializeApi();
  // Do something
  console.log("Api Connected");
}
```

You can set the chain endpoint by passing an endpoint parameter to the _`initializeApi`_ Function whereas the default chain endpoint is : `DEFAULT_CHAIN_ENDPOINT` = `"wss://alphanet.ternoa.com"`.
```javascript
{
   // Customizing API Endpoint
   await initializeApi('wss://mainnet.ternoa.io');
   
   // Do something
   console.log("Api Connected to mainnet");
}
```

 Pro Tip : Ternoa SDK provides a very useful `getRawApi()` function to interact with the API. If the API is connected, it'll be returned instantaneously.
```javascript
 {
   // Assuming that API has been initialized before
   const api = await getRawApi()

   // example : get last block
   const signedBlock = await api.rpc.chain.getBlock();
}
```

### Create an Account

You can create an account using the API itself. You'll need to call the `generateSeed` and `getKeyringFromSeed` functions. 

All functions are organized by a specific theme, for example, the function _generateSeed_ which allows us to create a new account and _getKeyringFromSeed_ which allows us to retrieve its address, can conveniently be found in **ternoa-js/src/account**.

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
### Create an NFT

Creating a basic NFT using the features provided by the SDK is easy enough. A short snippet of code allows you to Create, Submit and Sign an NFT. Essentially creating your NFT with the click of a button.

The function  `createNft` requires a few parameters like : `offchainData` aka metadata, the `royalty` percentage, its `collectionId` if you want it to belong to an existing collection, a Boolean value `isSoulBound` to determine its status, `keyring` parameter to sign and submit the transaction and a callback parameter `waitUntill`, to define when we get the results of that transaction execution.

```javascript
// The easiest way to Create your first NFT
import { createNft } from "ternoa-js/nft"
import { generateSeed, getKeyringFromSeed } from "ternoa-js/account"

const createMyFirstNFT = async () => {
  try {
    // We initialize an API instance connected to the Alphanet chain
    await initializeApi()

    // Here we create, sign and submit the NFT transaction with your keyring
    await createNft("My first NFT", 10, undefined, false, keyring, WaitUntil.BlockInclusion)
  } catch (e) {
    console.log(e)
  }
}
```

**That being said, You can opt for the manual route which although being complex, offers more  versatility.**

The Basic way automated the 3 steps (Create -> Sign => Send) assosiated with creating an NFT making it much easier to use while not allowing any customisation.

The manual way provides much more versatility but is significantly more complex.Let's say for example you can batch transactions together instead of executing them one by one (covered in example section). It'll be useful if you want to simplify the process of creating a large amount of NFTs and minimize repetitive tasks like sending and signing each transaction.

##### STEP 1 - Create an NFT transaction
First of all, instead of using the `createNft()` function, you will use `createNftTx()`. And instead of creating, signing and submiting the transaction and getting the returned events, it will just create an unsigned and unsubmitted Create-NFT Transaction Hash which will be valid for the next 5 minutes.

```javascript
// Imports
import { initializeApi } from "ternoa-js"
import { createNftTx } from "ternoa-js/nft"

const create createNFTManually = async () => {
  try {
    // STEP 1 : Here we create the transaction and get the transaction hash
    const nftTxHash = await createNftTx("My first NFT", 10, undefined, false)

    // Do something with the transaction hash
    console.log(nftTxHash);
  } catch (e) {
    console.log(e)
  }
}
```

##### STEP 2 - Sign a transaction hash
Now we have the `txHash`, we can move to the signing step. But before detailing it, it's good to know that "signing" can be directely embed in the submit function. It means that depending on the submit function you are using (see the last step below), signing your tx hash before submit might not be necessary. In case you sign manually the tx hash, you will receive a hex value of the signed transaction ready to be send. The `signTxHex()` function expect **a keyring** that will sign the transaction and the **transaction hash to be signed**.

```javascript
const create createNFTManually = async () => {
  try {
  // STEP 2 : Here we sign the transaction hash. nftTxHash is the name of the tx hash from the function we created before.
    const signTxHash = await signTxHex(keyring, nftTxHash)
    // Do something with the hex value. 
    console.log(signTxHash);
  } catch (e) {
    console.log(e)
  }
}
```

##### STEP 3 - Submit a transaction

Submiting a transaction is generally the last step of the transaction execussion process. Ternoa-js provides up to 3 ways to submit a transaction. From the raw and native way to the fully handled and easiest way. Depending on the response format you are expecting and the specific case you want to handle (simple submit, batching some transaction (...)) you will need to go with one of the following functions :

+ `submitTxHex()` - The most versatile and customizable way to submit your txHash. You can manage your self the callback function. It obvioulsy requires the hex value to be submited but also an optionnal callback. This function require the transaction hash to be signed before being sent.

```javascript
const create createNFTManually = async () => {
  try {
    // STEP 3.1 : Here we submit the transaction hex value. 
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

+ `submitTxBlocking()` - The most most convenient way to get Events and datas : This function will sign the transaction for you if you pass a keyring (one less thing to worry about) and it's blocking the execution flow until the transaction is either in a block or in a finalized block. Since submitting needs to work will all kinds of transactions, the result is an object that contains all the events that have happen (instead of only specific ones).
Note: Here you do not need to necessarily pass a signed `txHash`. If you pass the Keyring as a parameter and an unsigned tx hash as the signing process will be done here for you.

```javascript
const create createNFTManually = async () => {
  try {
    ...

    // STEP 3.2 : Here we submit the transaction hex value signed before. 
    // We could have used the unsigned tx Hash and pass a keyring as a third parameter instead.
    // Once again, we use here the tx hex signTxHash, from the previous step.
    const submitTxHash = await submitTxBlocking(signTxHash, WaitUntil.BlockInclusion)

    // Do something with the events recieved. 
    console.log(submitTxHash.findEvents(NFTCreatedEvent));
    ...
  } catch (e) {
    console.log(e)
  }
}
```

+ `submitTxNonBlocking()`: This one works as the `submitTxBlocking` but in a non blocking way. It returns a pair of objects that are used to track the progress of the transaction execution. The first returned object is a conditional variable which can yield the information if the operation is finished. The second returned objects is an array of events which gets populated automatically once the operation is finished.

```javascript
const create createNFTManually = async () => {
  try {
    ...

    // STEP 3.3 : It get the same parameters as the submitTxBlocking
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

**Ternoa Token Standardization** : Awaiting finalised TRC versions (Ternoa's Request for Comment)

## API Architecture : 

Ternoa SDK handles the main features proposed by the Ternoa chain. It allows you to run every transaction from the chain pallet, make a query like asking for some constant's storage. We also provide you with a bunch of helpers and utility functions to help you enjoy the full experience.

The main handlers are the ones below :
+ blockchain: Handles the CORE blockchain function.and the API brain randomely: initializes the API, execute transactions, query datas, batch transactions and much more.
+ account: the functions that allows you to generate a new seed and a keyring
+ balance: the Balance pallet with its extrinsics, query and storage.
+ nft: the NFT pallet with its extrinsics, query and storage.
+ marketplace: the Marketplace pallet with its extrinsics, query and storage.
+ events: the events list returned when `submitTxBlocking` function is triggered

### Handlers architecture
For those who are familiar with Polkadot, you will quickly recognize the design structure of the features. If you aren't aware, no worries, the basic principles are easy enough to grasp. Depending on the pallet or handler category, you'll retrive :

+ **Constants** to request the chain runtime constants.
+ **Storage** to query the chain state.
+ **Extrinsics** to execute the transactions.
+ _Utilities_ when available provides some additional usefull functions you can directly import in your project.

#### Response format
As it makes sense for us to provide you the easiest tools to build on the Ternoa chain, we also try to simplify the the response format of our functions as much as we can. Depending on if you want to get things done or if you go with the full customizable way and handle it yourself, we invite you to choose the right function : Events and features data will be provided directly on some function while only transaction hash hex will be returned on others.

## Documentation :

The official SDK documentation is available @ https://ternoa-js.ternoa.dev/ and any additional resources can be found over @ https://docs.ternoa.network/,

Discover our end-to-end test Dapp [here](https://e2e.ternoa.network/) to test out the Ternoa SDK.

Here's the Github repository if anyones wondering -> https://github.com/capsule-corp-ternoa/ternoa-js.

## Cookbook examples :

If you’re looking for a quick overview of the Ternoa SDK, its usage, explications, best practices, or just a simple how-to guide on how to create your first NFT, we recommend you take a look at the example section of [cookbook/basic-usage](https://github.com/capsule-corp-ternoa/ternoa-js/tree/1.1.0-basicNFTs-collections/examples/cookbook/basic-usage)

### Utility Batch/BatchAll :
`batchTxHex` or `batchAllTxHex` functions can be implemented into the execution process of a transaction. Both transactions do the exact same and accpect the same parameters. The difference however is that with `batchTxHex()` our transactions are executed one by one until one fails and terminates that action mid-batch. With `batchAllTxHex` it'll first try to execute them all and if any one of them fail, it'll revert the successful ones and the state of the chain will not change.

The general rule of thumb is to always use the **batchAll transaction**.

`batchTx` or `batchAllTx` functions also exist and return both the tx hash but not in hex format. They both work exactly the same.

As an example, this can be usefull if you want to create a large collection of NFTs and Instead of creating all of them one by one, it's recommended to group them all and execute them as one transaction. This allows you to save on transaction fees and most importantly to save your time.

### Let's assume we are trying to batch a mint of NFT
In this example we are going to run the `batchAllTxHex` because we want the process to stop and revert in case of error and an hex format as result, but `batchTxHex`, `batchTx` or `batchAllTx` could be used with the exact same code below.

```javascript
export const nftsBatchMintingHex = async (nftMetadata, quantity) => {
  // nftMetaData represents here the offChain datas of the NFT. 
  // quantity is the number of NFT to be minted
  try{
    // First we create the NFT
    const nftTx = await createNftTx(nftMetadata, 0, undefined, false)
    // Second we add all the NFT in an Array
    const nftsTxs = new Array(Number(quantity)).fill(nftTx)
    // We batch the transaction with the batchAllTxHex function
    return await batchAllTxHex(nftsTxs)
  }catch(error){
    console.log(error)
  }
}
```
### IPFS Upload
IPFS is one of the solutions we recommand to upload the NFT metadatas and to provide them as the offchainData of your feature. The full IPFS Upload will be soon added to the ternoa-js SDK. For now, we invite you to look at [this](https://github.com/capsule-corp-ternoa/ternoa-js/discussions/62) github discussions or to this [Dapp](https://github.com/capsule-corp-ternoa/ternoa-workshop/blob/main/helpers/ipfs.ts) we used for a workshop before.

Expected Format syntax :

**Ternoa basic NFT Off-Chain Metadata - object**
```bash
- title: Title of the NFT - string
- description: Description of the NFT - string
- image: IPFS hash of the NFT's asset - string
- properties: An object containing NFT's properties and at least a Media object - object
	- media: An object containing NFT's asset properties - object (see below)

media - object:
- hash : IPFS hash of the NFT asset - string
- type: Type of media (file format) - string
- size: size of the encrypted media - string
```

**Ternoa Collection Off-Chain Metadata - object**

```bash
- banner_image: IPFS hash of the collection's banner image - string
- name: Name of the collection - string
- description: Description of the collection - string
- profile_image: IPFS hash of the avatar/profile image assigned to the collection - string
```

**Ternoa Marketplace Off-Chain Metadata - object**

```bash
- name: Name of the marketplace - string
- logo_uri: Logo URI of the marketplace - string
```

### Connect wallet

Coming soon to a Ternoa chain near you 👀

## SDK Development :

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

You can locate the static website in the [docs/](https://github.com/capsule-corp-ternoa/ternoa-js/tree/main/docs) directory.

### Testing

The test suites rely upon testing pairs in the [testing pairs file](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/testingPairs.ts). In order to prepare these pairs, [test-setup.ts](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/scripts/test-setup.ts) and [test-teardown.ts](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/src/_misc/scripts/test-teardown.ts) are supplied and drained of `$CAPS` respectively. Environmental variables `SEED_TEST_FUNDS` and `SEED_TEST_FUNDS_PUBLIC_KEY` have to be defined in order to run these test suites.


To initiate the test suites, run:

```bash
npm run test
```

### Code Style

This project uses Industry standard ESLint and Typescript rules to ensure good coding practices and readability.

We’ve set up linters and formatters to help catch errors and enhance the overall experience:

- [Prettier](https://prettier.io/) – ensures that code is formatted in a readable way.
- [ESLint](https://eslint.org/) — checks code for antipatterns as well as formatting.

[Husky](https://typicode.github.io/husky) proceeds with checks before pushing a new commit. It verifies that the project is building, there are no formatting or linter issues, and the test suites aren’t broken.

> If you use Visual Studio Code editor, we suggest you to install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.

## Build And Run With Podman

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

## Tips to Run with Podman 

We’ll illustrate some useful podman commands and their use cases next. It’s important to note that we’ve omitted most of the flags to make them concise. Make sure to build the image as per the steps defined in the "Build and Run with Podman" section.

In case no command arguments are specified, It’ll tyr to build the `starter-project` by default. To override this, simply add `bash` at the end of the command. It'll look something like: `podman run tsdk bash`.

### Remove Container After Exit

A container that completed its execution or is no longer in use due to the user disconnecting will not be removed by default, it’ll switch to the exit state.
Use the flag `--rm` to make sure it’s deleted and later removed.

```bash
  # The --rm flag removes the container after usage.
  podman run --rm tsdk
  # Check if any container is running or stopped.
  podman ps -a
```

### Persistent Storage

The container uses a local copy of the repo in order to compile and run examples. This means that if changes are made inside the container, they’ll fail to propagate and will be lost. To mitigate this issue, the virtual container volume `/workdir` needs to be mapped to a directory on the host machine that contains the Ternoa.js repo. After the mapping is done, any changes made in the mapped directory will be reflected in the container.

This way, you can develop Dapps without having to install all the required dependencies. For the workflow check out the "Create A Development Environment" section.

```bash
  # Flag -v tells the host machine to map the physical "./." path with the virtual container one "/workdir". If no command arguments are given this will try to compile and run the starter-project project.
  podman run -v ./.:/workdir tsdk
```

### Run The Container And Access Its Shell

The predefined operation of the container when executed is to compile and and initiate the `starter-project`. To execute a different operation, additional commands can be passed at the end. For example: padding `bash` will run the bash shell session instead of the default operation.

```bash
  # If no command arguments are given this will try to compile and run the starter-project. By passing "bash" we make sure that we run a bash shell session once the container starts.
  podman run -it tsdk bash
```

### Create A Detached Instance And Access Its Shell

```bash
  # Flag "-d" runs the container in detached mode.
  podman run -d tsdk bash
  # Access its shell.
  podman exec -itl bash
```

### Create A Development Environment

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