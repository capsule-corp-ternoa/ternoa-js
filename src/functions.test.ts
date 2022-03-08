import { hello } from "./functions"

test("Should say hello world", () => {
    expect(hello()).toBe("Hello world")
}) 