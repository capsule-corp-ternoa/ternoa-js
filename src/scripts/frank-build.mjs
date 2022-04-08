import { readFileSync, writeFileSync, copyFileSync } from "fs"
import { resolve, join, basename } from "path"

const packagePath = process.cwd()
const buildPath = join(packagePath, "./build")

const writeJson = (targetPath, obj) => writeFileSync(targetPath, JSON.stringify(obj, null, 2), "utf8")

async function createPackageFile() {
  const packageData = JSON.parse(readFileSync(resolve(packagePath, "./package.json"), "utf8"))
  const newPackageData = {
    ...packageData,
    type: "module",
    main: "index.js",
    module: "index.js",
    types: "index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        default: "./index.js",
      },
      "./account": {
        types: "./functions/account/index.d.ts",
        default: "./functions/account/index.js",
      },
      "./balance": {
        types: "./functions/balance/index.d.ts",
        default: "./functions/balance/index.js",
      },
      "./blockchain": {
        types: "./functions/blockchain/index.d.ts",
        default: "./functions/blockchain/index.js",
      },
      "./capsule": {
        types: "./functions/capsule/index.d.ts",
        default: "./functions/capsule/index.js",
      },
      "./fee": {
        types: "./functions/fee/index.d.ts",
        default: "./functions/fee/index.js",
      },
      "./marketplace": {
        types: "./functions/marketplace/index.d.ts",
        default: "./functions/marketplace/index.js",
      },
      "./nft": {
        types: "./functions/nft/index.d.ts",
        default: "./functions/nft/index.js",
      },
      "./utils": {
        types: "./utils/blockchain.d.ts",
        default: "./utils/blockchain.js",
      },
      "./constants": {
        types: "./constants.d.ts",
        default: "./constants.js",
      },
    },
  }

  delete newPackageData.scripts
  delete newPackageData.devDependencies
  delete newPackageData.files

  const targetPath = resolve(buildPath, "./package.json")
  writeJson(targetPath, newPackageData)
  console.log(`Created package.json in ${targetPath}`)
}

async function includeFileInBuild(file) {
  const sourcePath = resolve(packagePath, file)
  const targetPath = resolve(buildPath, basename(file))
  copyFileSync(sourcePath, targetPath)
  console.log(`Copied ${sourcePath} to ${targetPath}`)
}

async function run() {
  try {
    await createPackageFile()
    await includeFileInBuild("./README.md")
    await includeFileInBuild("./LICENSE")
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
