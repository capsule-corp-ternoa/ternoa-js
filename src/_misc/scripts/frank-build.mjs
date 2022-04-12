import { readFileSync, writeFileSync, copyFileSync, readdirSync, unlinkSync, renameSync, rmdirSync, rmSync } from "fs"
import { resolve, join, basename } from "path"

const packagePath = process.cwd()
const buildPath = join(packagePath, "./build")

const writeJson = (targetPath, obj) => writeFileSync(targetPath, JSON.stringify(obj, null, 2), "utf8")

async function createPackageFile() {
  const packageData = JSON.parse(readFileSync(resolve(packagePath, "./package.json"), "utf8"))
  const newPackageData = {
    ...packageData,
    main: "index.cjs",
    // type: "module",
    module: "index.js",
    types: "index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        require: "./index.cjs",
        default: "./index.js",
      },
      "./account": {
        types: "./account/index.d.ts",
        require: "./account/index.cjs",
        default: "./account/index.js",
      },
      "./balance": {
        types: "./balance/index.d.ts",
        require: "./balance/index.cjs",
        default: "./balance/index.js",
      },
      "./blockchain": {
        types: "./blockchain/index.d.ts",
        require: "./blockchain/index.cjs",
        default: "./blockchain/index.js",
      },
      "./capsule": {
        types: "./capsule/index.d.ts",
        require: "./capsule/index.cjs",
        default: "./capsule/index.js",
      },
      "./fee": {
        types: "./fee/index.d.ts",
        require: "./fee/index.cjs",
        default: "./fee/index.js",
      },
      "./marketplace": {
        types: "./marketplace/index.d.ts",
        require: "./marketplace/index.cjs",
        default: "./marketplace/index.js",
      },
      "./nft": {
        types: "./nft/index.d.ts",
        require: "./nft/index.cjs",
        default: "./nft/index.js",
      },
      "./constants": {
        types: "./constants.d.ts",
        require: "./constants.cjs",
        default: "./constants.js",
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
