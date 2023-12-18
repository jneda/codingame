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
      const grid: string[][] = [];
      for (let r = 0; r < 9; r++) {
        const row = readline().split(" ");
        grid.push(row);
      }
      return grid;
    }

    function isArrayValid(arr: string[]) {
      return new Set(arr).size === 9;
    }

    function areRowsValid() {
      for (const row of grid) {
        if (!isArrayValid(row)) return false;
      }
      return true;
    }

    function areColumnsVaid() {
      for (let c = 0; c < 9; c++) {
        const column: string[] = [];
        for (let r = 0; r < 9; r++) {
          column.push(grid[r][c]);
        }
        if (!isArrayValid(column)) return false;
      }
      return true;
    }

    function isSubGridValid(vOffset: number, hOffset: number) {
      const arr: string[] = [];
      for (let r = 0 + vOffset; r < 3 + vOffset; r++) {
        for (let c = 0 + hOffset; c < 3 + hOffset; c++) {
          arr.push(grid[r][c]);
        }
      }
      return isArrayValid(arr);
    }

    function areSubGridsValid() {
      for (let i = 0; i < 9; i++) {
        const vOffset = Math.floor(i / 3) * 3;
        const hOffset = (i % 3) * 3;

        if (!isSubGridValid(vOffset, hOffset)) return false;
      }
      return true;
    }

    function isGridValid() {
      return areRowsValid() && areColumnsVaid() && areSubGridsValid();
    }

    const grid = parseInput();
    const gridIsValid = isGridValid().toString();

    const expectedResult = expected[index][0];
    console.assert(gridIsValid === expectedResult);

    console.log(gridIsValid);
  });

  return 0;
}

main();
