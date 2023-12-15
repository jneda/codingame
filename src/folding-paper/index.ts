import { getTestCases } from "../lib/fs";
import type { TestCases } from "../types/TestCases";

async function main() {
  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    return 1;
  }

  const inputs = testCases[0];
  const expected = testCases[1];

  inputs.forEach((input, index) => {
    function readline() {
      const line = input.shift();
      if (!line) throw new Error("Unexpected end of input.");
      return line;
    }

    const instructions = readline().split("") as Side[];
    const side = readline() as Side;

    console.error({ instructions, side });

    type Side = "U" | "D" | "L" | "R";

    const adjacencies: Record<Side, { opposite: Side; others: Side[] }> = {
      U: { opposite: "D", others: ["L", "R"] },
      D: { opposite: "U", others: ["L", "R"] },
      L: { opposite: "R", others: ["U", "D"] },
      R: { opposite: "L", others: ["U", "D"] },
    };

    let foldsCount: Record<Side, number> = {
      U: 1,
      D: 1,
      L: 1,
      R: 1,
    };

    for (const foldedSide of instructions) {
      foldsCount[adjacencies[foldedSide].opposite] += foldsCount[foldedSide];
      foldsCount[foldedSide] = 1;
      for (const otherSide of adjacencies[foldedSide].others) {
        foldsCount[otherSide] *= 2;
      }
    }

    console.error({ foldsCount, expected: expected[index] });
    console.log(foldsCount[side]);
  });

  return 0;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
