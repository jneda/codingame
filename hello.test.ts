import { describe, expect, test } from "@jest/globals";
import { sayHello } from "./hello";

describe("sayHello", () => {
  test("says Hello!", () => {
    expect(sayHello()).toBe("Hello!");
  });
});
