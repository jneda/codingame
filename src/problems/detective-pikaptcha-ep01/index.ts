// https://www.codingame.com/training/easy/detective-pikaptcha-ep1
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
      const [w, h] = readline().split(" ").map(Number);

      const grid: string[] = [];

      for (let r = 0; r < h; r++) {
        grid.push(readline());
      }

      return { w, h, grid };
    }

    function getNeighbors(r: number, c: number, grid: string[]) {
      const isInBounds = (r: number, c: number) =>
        0 <= r && r < grid.length && 0 <= c && c < grid[0].length;
      const isOpen = (r: number, c: number) =>
        isInBounds(r, c) && grid[r][c] !== "#";
      const dirs = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];

      const neighbors: [number, number][] = [];

      for (const dir of dirs) {
        const [dR, dC] = dir;
        const [nR, nC] = [r + dR, c + dC];
        if (isOpen(nR, nC)) neighbors.push([nR, nC]);
      }

      return neighbors;
    }

    const { w, h, grid } = parse();

    for (let r = 0; r < h; r++) {
      let row = "";
      for (let c = 0; c < w; c++) {
        const currentTile = grid[r][c];
        if (currentTile === "#") {
          row += "#";
          continue;
        }
        const openNeighborsCount = getNeighbors(r, c, grid).length;
        row += openNeighborsCount;
      }
      console.log(row);
    }
  });

  return 0;
}

main();
