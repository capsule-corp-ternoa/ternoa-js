import type { Config } from "jest"

export default async (): Promise<Config> => {
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    // testSequencer: "./src/_misc/CustomSequencer.js",
    detectOpenHandles: true,
    forceExit: true,
    testTimeout: 30000,
    silent: true,
    globalSetup: "./src/_misc/scripts/test-setup.ts",
    globalTeardown: "./src/_misc/scripts/test-teardown.ts",
  }
}
