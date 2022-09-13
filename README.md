# ⚙️ Ternoa SDK

[![npm version](https://badge.fury.io/js/ternoa-js.svg)](https://badge.fury.io/js/ternoa-js)

The easiest and fastest way to build on top of Ternoa Chain.

If you want to learn how to use Ternoa SDK, the [ternoa-js-test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) is the perfect entry door. You can start by contributing there to familiarise yourself with our architecture.

## Installation

### [Node.js](https://nodejs.org/en/download/)

```bash
npm install ternoa-js
```

> This package provides TypeScript types, but you will need TypeScript version 4.2 or higher to use them properly.

## Quick Start

An API instance must be initialize using the _initializeApi_ function in **ternoa-js/blockchain** before calling some SDK functions. The default chain endpoint is: `DEFAULT_CHAIN_ENDPOINT = "wss://alphanet.ternoa.com"`. It can be modified by passing a new endpoint as a parameter to the _initializeApi_ function.

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
    // We initialize an API instance connected to the Alphanet chain
    await initializeApi()

    // Here we create, sign and submit the NFT transaction with your keyring
    await createNft("My first NFT", 10, undefined, false, keyring, WaitUntil.BlockInclusion)
  } catch (e) {
    console.log(e)
  }
}
```

## Documentation

The official SDK documentation is available: [ternoa-js sdk documentation](http://ternoa-js.ternoa.dev). Additional resources are available on the [ternoa official documentation](https://docs.ternoa.network/).

Discover our End-to-End Test dApp here to learn and test the Ternoa SDK : [ternoa-js-test-dapp](https://e2e.ternoa.network/).

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

> If you use Visual Studio Code editor we suggest you to install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.

## Contribution

ternoa-js SDK is an open-source project, feel free to interact and move forward with us.

If you are interested in contributing to the Ternoa SDK read our [contributing guidelines](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/CONTRIBUTING.md).

If you want to learn how to use Ternoa SDK, the [ternoa-js-test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) is the perfect entry door. You can start by contributing there to familiarise yourself with our architecture.

## Build And Run With Podman

```bash
  # Downloads the package lists and "updates" them.
  sudo apt update -y
  # Installing podman.
  sudo apt install podman
  # Building the image using podman and the already available Dockerfile.
  podman build -t tsdk .
  # Checking if everything is OK.
  podman images | grep tsdk
  # Run the tsk image.
  podman run tsdk
```

## Run With Podman Tips

In the next examples some useful Podman commands will be shown. It's important to note that most flags have been omitted in order to make the examples more concise. Before running anything make sure that the image was built from the the "Build And Run With Podman" step.

If no command arguments are given by default it will try to build the starter-project project. To cancel this add `bash` at the end of the command. Example: `podman run tsdk bash`.

### Remove Container After Exit

A container that was run and it's job has been finished or the user has exited will not automatically be removed instead it will enter the Exit state.
To make sure that the container is deleted and removed after it's being used the flag `--rm` should be used.

```bash
  # The --rm flag removes the container after usage.
  podman run --rm tsdk
  # Check if any container is running or stopped.
  podman ps -a
```

### Persistent Storage

Container uses a local copy of the repo in order to compile and run examples. This means that if code changes are made inside the container that they will not propagate and they will be lost. To change this the virtual container volume `/workdir` needs to be mapped to a directory on the host machine that contains the Ternoa-js repo. With the mapping done any change in the mapped directory will be visible to the container.

This can be useful if you want to develop applications without installing all the dependencies for it. For the workflow check the [Create A Development Environment](#create-a-detached-instance-and-access-its-shell) segment.

```bash
  # Flag -v tells the host machine to map the physical "./." path with the virtual container one "/workdir". If no command arguments are given this will try to compile and run the starter-project project.
  podman run -v ./.:/workdir tsdk
```

### Run The Container And Access Its Shell

The predefined operation/command of the container when run is to compile and run the starter-project. To execute a different operation additional commands can be passed at the end of the run command. Example: passing `bash` will run the bash shell session instead the default operation.

```bash
  # If no command arguments are given this will try to compile and run the starter-project project. By passing "bash" we make sure that we run a bash shell session once the container starts.
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

The dockerfile is made in a way that it can be used to develope new applications with it.
Example of a typical workflows:

- The host installs git, clones the repo and install a code editor like VS Code.
- The host runs the container in a interactive mode with /workdir pointing to a workdir on host machine (can be your own project or ternoa-js).
- The host writes code via a code editor and uses the terminal (which is connected to the container) to run the `tsc` and `node` commands.
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

ternoa-js uses an [Apache-2.0 License](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/LICENSE).
