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

    function readInput() {
      const size = Number(readline());
      const grid: string[][] = [];
      for (let r = 0; r < size; r++) {
        grid.push(readline().split(""));
      }

      const clues = readline()
        .split(" ")
        .map((s) => s.toUpperCase());

      return { size, grid, clues };
    }

    function getRowString(r: number, reverse: boolean = false) {
      return reverse
        ? grid[r].slice().reverse().join("")
        : grid[r].slice().join("");
    }

    function checkRows() {
      for (let r = 0; r < size; r++) {
        const rowString = getRowString(r);
        for (const clue of clues) {
          if (rowString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startColumn = rowString.indexOf(clue);
            for (let c = startColumn; c < startColumn + clue.length; c++) {
              usedCells.add(JSON.stringify([r, c]));
            }
          }
        }
        const reverseRowString = getRowString(r, true);
        for (const clue of clues) {
          if (reverseRowString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startColumn = reverseRowString.indexOf(clue);
            // console.log({ reverseRowString, clue, startColumn });
            for (let c = startColumn; c < startColumn + clue.length; c++) {
              usedCells.add(
                JSON.stringify([r, reverseRowString.length - 1 - c])
              );
            }
          }
        }
      }
    }

    function getColumnString(c: number, reverse: boolean = false) {
      const column: string[] = [];
      for (let r = 0; r < size; r++) {
        column.push(grid[r][c]);
      }
      return reverse ? column.reverse().join("") : column.join("");
    }

    function checkColumns() {
      for (let c = 0; c < size; c++) {
        const columnString = getColumnString(c);
        for (const clue of clues) {
          if (columnString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startRow = columnString.indexOf(clue);
            for (let r = startRow; r < startRow + clue.length; r++) {
              usedCells.add(JSON.stringify([r, c]));
            }
          }
        }
        const reverseColumnString = getColumnString(c, true);
        for (const clue of clues) {
          if (reverseColumnString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startRow = reverseColumnString.indexOf(clue);
            // console.log({ reverseColumnString, clue, startRow });
            for (let r = startRow; r < startRow + clue.length; r++) {
              usedCells.add(
                JSON.stringify([reverseColumnString.length - 1 - r, c])
              );
            }
          }
        }
      }
    }

    function getDiagonalString(
      r: number,
      c: number,
      reverse: boolean = false,
      leftToRight: boolean = true
    ) {
      const diagonal: string[] = [];
      switch (leftToRight) {
        case true: {
          for (let i = 0; i < size; i++) {
            const dR = r + i;
            const dC = c + i;
            if (dR >= size || dC >= size) break;
            diagonal.push(grid[dR][dC]);
          }
          break;
        }
        case false: {
          for (let i = 0; i < size; i++) {
            const dR = r + i;
            const dC = size - 1 - c - i;
            if (dR >= size || dC >= size) break;
            diagonal.push(grid[dR][dC]);
          }
        }
      }

      return reverse ? diagonal.reverse().join("") : diagonal.join("");
    }

    function checkDiagonals() {
      // left to right
      for (let r = 0; r < size; r++) {
        const diagonalString = getDiagonalString(r, 0);
        for (const clue of clues) {
          if (diagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = diagonalString.indexOf(clue);
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(JSON.stringify([r + i, i]));
            }
          }
        }
        const reverseDiagonalString = getDiagonalString(r, 0, true);
        for (const clue of clues) {
          if (reverseDiagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = reverseDiagonalString.indexOf(clue);
            // console.log(reverseDiagonalString, clue, startIndex);
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(
                JSON.stringify([size - 1 - i, size - 1 - r - i])
              );
            }
          }
        }
      }

      for (let c = 1; c < size; c++) {
        const diagonalString = getDiagonalString(0, c);
        for (const clue of clues) {
          if (diagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = diagonalString.indexOf(clue);
            // console.log({ diagonalString, clue, startIndex });
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(JSON.stringify([i, c + i]));
            }
          }
        }
        const reverseDiagonalString = getDiagonalString(0, c, true);
        for (const clue of clues) {
          if (reverseDiagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = reverseDiagonalString.indexOf(clue);
            // console.log(reverseDiagonalString, clue, startIndex);
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(
                JSON.stringify([size - 1 - c - i, size - 1 - i])
              );
            }
          }
        }
      }

      // right to left
      for (let r = 0; r < size; r++) {
        const diagonalString = getDiagonalString(r, 0, false, false);
        for (const clue of clues) {
          if (diagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = diagonalString.indexOf(clue);
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(JSON.stringify([r + i, size - 1 - i]));
            }
          }
        }
        const reverseDiagonalString = getDiagonalString(r, 0, true, false);
        for (const clue of clues) {
          if (reverseDiagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = reverseDiagonalString.indexOf(clue);
            // console.log(reverseDiagonalString, clue, startIndex);
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(
                JSON.stringify([size - 1 - i, r + i])
              );
            }
          }
        }
      }

      for (let c = 1; c < size; c++) {
        const diagonalString = getDiagonalString(0, c, false, false);
        for (const clue of clues) {
          if (diagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = diagonalString.indexOf(clue);
            // console.log({ diagonalString, clue, startIndex });
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(JSON.stringify([i, size - 1  - c - i]));
            }
          }
        }
        const reverseDiagonalString = getDiagonalString(0, c, true, false);
        for (const clue of clues) {
          if (reverseDiagonalString.includes(clue)) {
            // console.log(`found ${clue}`);
            const startIndex = reverseDiagonalString.indexOf(clue);
            // console.log(reverseDiagonalString, clue, startIndex);
            for (let i = startIndex; i < startIndex + clue.length; i++) {
              usedCells.add(
                JSON.stringify([size -1 - c - i, i])
              );
            }
          }
        }
      }
    }

    function printResult() {
      for (let r =0; r < size; r++) {
        let rowString = "";
        for (let c = 0; c < size; c++) {
          const pos = JSON.stringify([r, c]);
          rowString += usedCells.has(pos) ? grid[r][c] : " ";
        }
        console.log(rowString);
      }
    }

    const { size, grid, clues } = readInput();
    const usedCells = new Set<string>();

    checkRows();
    checkColumns();
    checkDiagonals();
    
    printResult();
  });

  return 0;
}

main();
