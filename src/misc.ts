export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ConditionalVariable {
  done: boolean
  maxWaitTime?: number // In Milliseconds
  sleepInterval: number // In Milliseconds

  constructor(sleepInterval = 500, maxWaitTime?: number) {
    this.done = false
    this.maxWaitTime = maxWaitTime
    this.sleepInterval = sleepInterval
  }

  notify() {
    this.done = true
  }

  async wait(): Promise<boolean> {
    let sum = 0
    while (this.done === false) {
      if (this.maxWaitTime && sum >= this.maxWaitTime) {
        return false
      }

      await sleep(this.sleepInterval)
      sum += this.sleepInterval
    }

    return true
  }

  isDone() {
    return this.done
  }

  clear() {
    this.done = false
  }
}

export function hex2a(hex: any) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2) {
    var v = parseInt(hex.substr(i, 2), 16);
    if (v) str += String.fromCharCode(v);
  }
  return str;
}