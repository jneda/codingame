// https://www.codingame.com/training/easy/embedded-chessboards
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

    type Grid = [number, number, boolean];

    const CHESSBOARD_SIZE = 8;

    function parse() {
      const grids: Grid[] = [];

      const n = Number(readline());
      for (let i = 0; i < n; i++) {
        const [h, w, isGridWhite] = readline().split(" ");
        grids.push([Number(h), Number(w), isGridWhite === "1"]);
      }

      return grids;
    }

    function enumerateChessboards(grid: Grid) {
      const [h, w, isGridWhite] = grid;
      let validCount = 0;

      for (let r = 0; r <= h - CHESSBOARD_SIZE; r++) {
        for (let c = 0; c <= w - CHESSBOARD_SIZE; c++) {
          const isWhite = isGridWhite ? (c + r) % 2 === 0 : (c + r) % 2 === 1;
          if (isWhite) validCount++;
        }
      }

      return validCount;
    }

    const grids = parse();
    
    for (const grid of grids) {
      const validCount = enumerateChessboards(grid);
      console.log(validCount);
    }
  });

  return 0;
}

main();
