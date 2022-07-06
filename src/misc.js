"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalVariable = exports.sleep = void 0;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
class ConditionalVariable {
    constructor(sleepInterval = 500, maxWaitTime) {
        this.done = false;
        this.maxWaitTime = maxWaitTime;
        this.sleepInterval = sleepInterval;
    }
    notify() {
        this.done = true;
    }
    async wait() {
        let sum = 0;
        while (this.done === false) {
            if (this.maxWaitTime && sum >= this.maxWaitTime) {
                return false;
            }
            await sleep(this.sleepInterval);
            sum += this.sleepInterval;
        }
        return true;
    }
    isDone() {
        return this.done;
    }
    clear() {
        this.done = false;
    }
}
exports.ConditionalVariable = ConditionalVariable;
