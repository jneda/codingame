// https://www.codingame.com/ide/puzzle/create-turn-here-signs

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
      type ArrowData = {
        direction: string;
        arrowsCount: number;
        height: number;
        thickness: number;
        spacing: number;
        indent: number;
      };

      const [direction, arrowsCount, height, thickness, spacing, indent] =
        readline()
          .split(" ")
          .map((v) => (v === "left" || v === "right" ? v : parseInt(v)));

      return {
        direction,
        arrowsCount,
        height,
        thickness,
        spacing,
        indent,
      } as ArrowData;
    }

    function draw() {
      let base = Array(arrowsCount)
        .fill((direction === "left" ? "<" : ">").repeat(thickness))
        .join(" ".repeat(spacing));

      const halfHeight = Math.floor(height / 2);

      const withPadding = (row: number) =>
        " "
          .repeat(indent * (direction === "left" ? halfHeight - row : row))
          .concat(base);

      const upperHalf: string[] = [];
      for (let i = 0; i < halfHeight; i++) {
        upperHalf.push(withPadding(i));
      }

      const centerRow = direction === "left" ? base : withPadding(halfHeight);
      const bottomHalf = upperHalf.slice().reverse();

      const sign = upperHalf.concat(centerRow, bottomHalf);

      console.log(sign.join("\n"));
    }

    const { direction, arrowsCount, height, thickness, spacing, indent } =
      parseInput();
    draw();
  });

  return 0;
}

main();
