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
    main: "./index.js",
    types: "./index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        default: "./index.js",
      },
      "./account": {
        types: "./account/index.d.ts",
        default: "./account/index.js",
      },
      "./balance": {
        types: "./balance/index.d.ts",
        default: "./balance/index.js",
      },
      "./blockchain": {
        types: "./blockchain/index.d.ts",
        default: "./blockchain/index.js",
      },
      "./capsule": {
        types: "./capsule/index.d.ts",
        default: "./capsule/index.js",
      },
      "./fee": {
        types: "./fee/index.d.ts",
        default: "./fee/index.js",
      },
      "./marketplace": {
        types: "./marketplace/index.d.ts",
        default: "./marketplace/index.js",
      },
      "./nft": {
        types: "./nft/index.d.ts",
        default: "./nft/index.js",
      },
      "./constants": {
        types: "./constants.d.ts",
        default: "./constants.js",
      },
      "./package.json": "./package.json",
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
