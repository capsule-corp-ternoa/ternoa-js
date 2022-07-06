export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class ConditionalVariable {
    done: boolean;
    maxWaitTime?: number // In Milliseconds
    sleepInterval: number // In Milliseconds

    constructor(sleepInterval: number = 500, maxWaitTime?: number) {
        this.done = false;
        this.maxWaitTime = maxWaitTime;
        this.sleepInterval = sleepInterval;
    }

    notify() {
        this.done = true;
    }

    async wait(): Promise<boolean> {
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