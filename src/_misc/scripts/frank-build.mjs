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
    main: "./dist/cjs/index.js",
    module: "./dist/esm/index.js",
    types: "./dist/esm/index.d.ts",
    exports: {
      ".": {
        types: "./dist/esm/index.d.ts",
        require: "./dist/cjs/index.js",
        default: "./dist/esm/index.js",
      },
      "./account": {
        types: "./dist/esm/account/index.d.ts",
        require: "./dist/cjs/account/index.js",
        default: "./dist/esm/account/index.js",
      },
      "./balance": {
        types: "./dist/esm/balance/index.d.ts",
        require: "./dist/cjs/balance/index.js",
        default: "./dist/esm/balance/index.js",
      },
      "./blockchain": {
        types: "./dist/esm/blockchain/index.d.ts",
        require: "./dist/cjs/blockchain/index.js",
        default: "./dist/esm/blockchain/index.js",
      },
      "./capsule": {
        types: "./dist/esm/capsule/index.d.ts",
        require: "./dist/cjs/capsule/index.js",
        default: "./dist/esm/capsule/index.js",
      },
      "./fee": {
        types: "./dist/esm/fee/index.d.ts",
        require: "./dist/cjs/fee/index.js",
        default: "./dist/esm/fee/index.js",
      },
      "./marketplace": {
        types: "./dist/esm/marketplace/index.d.ts",
        require: "./dist/cjs/marketplace/index.js",
        default: "./dist/esm/marketplace/index.js",
      },
      "./nft": {
        types: "./dist/esm/nft/index.d.ts",
        require: "./dist/cjs/nft/index.js",
        default: "./dist/esm/nft/index.js",
      },
      "./constants": {
        types: "./dist/esm/constants.d.ts",
        require: "./dist/cjs/constants.js",
        default: "./dist/esm/constants.js",
      },
    },
    typesVersions: {
      "*": {
        account: ["./dist/esm/account/index.d.ts"],
        balance: ["./dist/esm/balance/index.d.ts"],
        blockchain: ["./dist/esm/blockchain/index.d.ts"],
        capsule: ["./dist/esm/capsule/index.d.ts"],
        fee: ["./dist/esm/fee/index.d.ts"],
        marketplace: ["./dist/esm/marketplace/index.d.ts"],
        nft: ["./dist/esm/nft/index.d.ts"],
        constants: ["./dist/esm/constants/index.d.ts"],
      },
    },
  }

  delete newPackageData.scripts
  delete newPackageData.devDependencies

  const targetPath = resolve(buildPath, "./package.json")
  writeJson(targetPath, newPackageData)

  const cjsPath = join(buildPath, "./dist/cjs")
  const targetCjsPath = resolve(cjsPath, "./package.json")
  writeJson(targetCjsPath, { type: "commonjs" })

  console.log(`Created package.json in ${targetPath} and ${targetCjsPath}`)
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
