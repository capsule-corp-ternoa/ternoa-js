import { readFileSync, writeFileSync, copyFileSync } from "fs"
import { resolve, join, basename } from "path"

const packagePath = process.cwd()
const buildPath = join(packagePath, "./build")

const writeJson = (targetPath, obj) => writeFileSync(targetPath, JSON.stringify(obj, null, 2), "utf8")

async function createPackageFile() {
  const packageData = JSON.parse(readFileSync(resolve(packagePath, "./package.json"), "utf8"))
  const newPackageData = {
    ...packageData,
    main: "index.js",
    types: "index.d.ts",
    exports: {
      ".": "./index.js",
      "./account": "./functions/account/index.js",
      "./balance": "./functions/balance/index.js",
      "./blockchain": "./functions/blockchain/index.js",
      "./capsule": "./functions/capsule/index.js",
      "./fee": "./functions/fee/index.js",
      "./marketplace": "./functions/marketplace/index.js",
      "./nft": "./functions/nft/index.js",
    },
  }

  delete newPackageData.scripts
  delete newPackageData.devDependencies

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
    // await includeFileInBuild("./LICENSE")
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
