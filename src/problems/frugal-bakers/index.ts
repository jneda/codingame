// https://www.codingame.com/ide/puzzle/should-bakers-be-frugal
import { getTestCases } from "../../lib/fs";
import type { TestCases } from "../../types/TestCases";

async function main() {
  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    return 1;
  }

  const [inputs, expected] = testCases;

  inputs.forEach((input, index) => {
    function readline() {
      const line = input.shift();
      if (!line) throw new Error("Unexpected end of input.");
      return line;
    }

    function parseInput() {
      const [side, diameter] = readline()
        .split(" ")
        .map((v) => parseFloat(v));
      return { side, diameter };
    }

    const { side, diameter } = parseInput();

    const biscuitArea = Math.PI * (diameter / 2) ** 2;
    const squareBiscuitArea = diameter ** 2;
    const remainingDoughPerBiscuit = squareBiscuitArea - biscuitArea;

    let wastefulCount = 0;
    let frugalCount = 0;
    let currentSide = side;

    while (currentSide > diameter) {
      const biscuitsPerSide = Math.floor(currentSide / diameter);
      const totalBiscuits = biscuitsPerSide ** 2;
      if (wastefulCount === 0) wastefulCount = totalBiscuits;
      frugalCount += totalBiscuits;

      const startArea = currentSide ** 2;
      const remainingDoughInBiscuitsArea =
        remainingDoughPerBiscuit * totalBiscuits;
      const remainingDouhgOutsideBiscuitsArea =
        startArea - squareBiscuitArea * totalBiscuits;
      const totalRemainingDough =
        remainingDoughInBiscuitsArea + remainingDouhgOutsideBiscuitsArea;
      const newSide = Math.sqrt(totalRemainingDough);
      currentSide = newSide;
    }

    const difference = frugalCount - wastefulCount;
    const expectedDifference = parseInt(expected[index][0]);

    console.assert(difference === expectedDifference);
    console.error({
      wastefulCount,
      frugalCount,
      difference,
      expectedDifference,
    });
    console.log(difference);
    console.error();
  });

  return 0;
}

main();
