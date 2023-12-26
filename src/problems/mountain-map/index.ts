// https://www.codingame.com/training/easy/mountain-map
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

    function parse() {
      const _n = Number(readline());
      const heights = readline().split(" ").map(Number);

      return heights;
    }

    function drawMountain(h: number) {
      const rows: string[] = [];
      for (let r = 0; r < h; r++) {
        let row = "";
        row +=
          " ".repeat(r) +
          "/" +
          " ".repeat((h - 1 - r) * 2) +
          "\\" +
          " ".repeat(r);
        rows.unshift(row);
      }
      return rows;
    }

    const heights = parse();

    const mountains = heights.map((h) => drawMountain(h));

    const maxHeight = Math.max(...heights);

    const rows: string[] = [];

    for (let r = 0; r < maxHeight; r++) {
      let row = "";
      mountains.forEach((m, i) => {
        const mRow = m.pop() ?? " ".repeat(heights[i] * 2);
        row += mRow;
      });
      // strip trailing spaces
      const regex = /.*\\(\s*)$/;
      const found = row.match(regex);
      if (found) {
        // found[1] is the capturing group for trailing spaces
        row = row.slice(0, row.length - found[1].length);
      }
      rows.unshift(row);
    }

    rows.forEach((r) => console.log(r));
  });

  return 0;
}

main();
