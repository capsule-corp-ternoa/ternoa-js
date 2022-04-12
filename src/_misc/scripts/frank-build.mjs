import { readFileSync, writeFileSync, copyFileSync, readdirSync, unlinkSync, renameSync, rmdirSync, rmSync } from "fs"
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
    type: "module",
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

async function prepareCJSFiles(path = "./build/cjs") {
  const files = readdirSync(path)
  for (const file of files){
    if (file.endsWith('.js')){
      const newFileName = file.split('.')[0] + '.cjs'
      renameSync(`${path}/${file}`, `${path}/${newFileName}`)
      const newPath = path.split('/').filter(x => x!=='cjs').join('/')
      copyFileSync(`${path}/${newFileName}`, `${newPath}/${newFileName}`)
    } else if (file.endsWith('.d.ts')) {
      unlinkSync(`${path}/${file}`)
    } else {
      await prepareCJSFiles(`${path}/${file}`)
    }
  }
}

async function prepareCJSBuild() {
  rmSync("./build/cjs", {recursive:true, force:true})
  console.log('CJS build succesfully done')
}

async function run() {
  try {
    await createPackageFile()
    await includeFileInBuild("./README.md")
    await includeFileInBuild("./LICENSE")
    await prepareCJSFiles()
    await prepareCJSBuild()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
