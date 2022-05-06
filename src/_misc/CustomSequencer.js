/* eslint-disable @typescript-eslint/no-var-requires */
const TestSequencer = require("@jest/test-sequencer").default

class CustomSequencer extends TestSequencer {
  sort(tests) {
    return tests.sort((testA) => {
      if (testA.path.includes("balance")) {
        return 1
      } else {
        return -1
      }
    })
  }
}

module.exports = CustomSequencer
