# ⚙️ Ternoa SDK

[![npm version](https://badge.fury.io/js/ternoa-js.svg)](https://badge.fury.io/js/ternoa-js)

The easiest and fastest way to build on top of Ternoa Chain.

You can start by familiarizing yourself with the architecture and playing around with the ternoa.js [test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) to get a good grasp of the Ternoa SDK.

Lastly and most importantly, don’t forget to have fun, we (really) want you to have a good time.

## Installation

### [Node.js](https://nodejs.org/en/download/)

Install the ternoa.js lirary by running this command :

```bash
npm install ternoa-js
```

> This package provides TypeScript types, but you will need TypeScript version 4.2 or higher to use them properly.

## Quick Start

Before you can start calling any functions, you'll need to initialize an API Instance using the _initializeApi_ function located in **ternoa-js/blockchain**.
You can set the chain endpoint by passing an endpoint parameter to the _initializeApi_ Function whereas the default chain endpoint is : `DEFAULT_CHAIN_ENDPOINT = "wss://alphanet.ternoa.com"`.

All functions are organized by a specific theme, for example, the function _generateSeed_ allows us to create a new account and _getKeyringFromSeed_ allows us to retrieve its address, which can conveniently be found in **ternoa-js/account**.

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

Among all the features provided by the Ternoa SDK, this short snippet of code allows you to Create, Submit and Sign an NFT. This function  _createNft_ requires a few parameters like : `offchainData` aka metadata, the `royalty` percentage, its `collectionId` if you want it to belong to an existing collection, a Boolean value `isSoulBound` to determine its status, `keyring` parameter to sign and submit the transaction and a callback parameter `waitUntill`, to define when we get the results of that transaction execution.

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

The official SDK documentation is available @ https://ternoa-js.ternoa.dev/ and any additional resources can be found over @ https://docs.ternoa.network/,

Discover our end-to-end test Dapp [here](https://e2e.ternoa.network/)
to try out the Ternoa SDK.

### Cookbook example

If you’re looking for a quick overview of the Ternoa SDK, its usage, explications, best practices, or just a simple how-to guide on how to create your first NFT, we recommend you take a look at the example section of [cookbook/basic-usage](https://github.com/capsule-corp-ternoa/ternoa-js/tree/1.1.0-basicNFTs-collections/examples/cookbook/basic-usage)

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

## Contribution

Ternoa.js is an open-source SDK, feel free to interact and help us improve.

If you’re interested in contributing to the Ternoa SDK, we recommend you check out our [contribution guidelines](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/CONTRIBUTING.md).

If you want to learn how to use the Ternoa SDK, the [test-dapp](https://github.com/capsule-corp-ternoa/ternoa-js-test-dapp) is the perfect place for you to start, that way you can familiarize yourself with our architecture and contribute to the ecosystem's development.

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

The predefined operation of the container when executed is to compile and and initiate the Starter-project. To execute a different operation, additional commands can be passed at the end. For example: padding `bash` will run the bash shell session instead of the default operation.

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

Ternoa.js uses the [Apache-2.0 License](https://github.com/capsule-corp-ternoa/ternoa-js/blob/main/LICENSE).
