Table of Contents:

- [Build And Run Locally](#build-and-run-locally)
- [Build and Run With Podman](#build-and-run-with-podman)

## Build And Run Locally
All the examples in this document assume that you use a Ubuntu like system. If that's not the case, you need to change the commands so that it works for your system.
```bash
  # Downloads the package lists and "updates" them.
  sudo apt update -y
  # Installing all dependencies
  sudo apt install git curl -y
  # Installing NVM.
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  # Starting a new bash environment so we have access to nvm command.
  exec bash
  # Installing Node and Typescript
  nvm install 18.7.0 && nvm use 18 && npm install -g typescript
  # This prints out the current node and typescript version.
  node -v && tsc -v
  # Compile starter-project
  tsc
  # You can run the project with calling node on index.js
  node ./src/index.js
  # or you can compile and run the project with the following command.
  npm run start
```

## Build and Run With Podman
Check the top level [Build And Run With Podman](../../README.md) documentation.