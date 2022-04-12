import { readFileSync, writeFileSync, copyFileSync } from "fs"
import { resolve, join, basename } from "path"

const packagePath = process.cwd()
const buildPath = join(packagePath, "./build")

const writeJson = (targetPath, obj) => writeFileSync(targetPath, JSON.stringify(obj, null, 2), "utf8")

async function createPackageFile() {
  const packageData = JSON.parse(readFileSync(resolve(packagePath, "./package.json"), "utf8"))
  const newPackageData = {
    ...packageData,
    module: "./index.js",
    main: "./index.cjs",
    types: "./index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        default: "./index.js",
        require: "./index.cjs"
      },
      "./account": {
        types: "./account/index.d.ts",
        default: "./account/index.js",
        require: "./account/index.cjs"
      },
      "./balance": {
        types: "./balance/index.d.ts",
        default: "./balance/index.js",
        require: "./balance/index.cjs"
      },
      "./blockchain": {
        types: "./blockchain/index.d.ts",
        default: "./blockchain/index.js",
        require: "./blockchain/index.cjs"
      },
      "./capsule": {
        types: "./capsule/index.d.ts",
        default: "./capsule/index.js",
        require: "./capsule/index.cjs"
      },
      "./fee": {
        types: "./fee/index.d.ts",
        default: "./fee/index.js",
        require: "./fee/index.cjs"
      },
      "./marketplace": {
        types: "./marketplace/index.d.ts",
        default: "./marketplace/index.js",
        require: "./marketplace/index.cjs"
      },
      "./nft": {
        types: "./nft/index.d.ts",
        default: "./nft/index.js",
        require: "./nft/index.cjs"
      },
      "./constants": {
        types: "./constants.d.ts",
        default: "./constants.js",
        require: "./constants.cjs"
      },
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
    await includeFileInBuild("./LICENSE")
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
