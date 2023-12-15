import { beforeAll, describe, expect, test } from "@jest/globals";
import { getTestCases } from "../../lib/fs";
import { countSquares } from ".";

describe("countSquares", () => {
  test("it should return the correct number of squares", async () => {
    let testCases: [string[][], string[][]];
    try {
      testCases = await getTestCases(__dirname, "test.txt");
    } catch (error) {
      console.error(error);
      return 1;
    }

    const [inputs, expected] = testCases;
    const expectedCounts = expected.map(([count]) => Number.parseInt(count));

    inputs.forEach((input, index) => {
      const actual = countSquares(input);
      expect(actual).toBe(expectedCounts[index]);
    });
  });
});
