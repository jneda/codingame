// https://www.codingame.com/training/easy/object-insertion
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

    class Vector {
      r: number;
      c: number;

      constructor(r: number, c: number) {
        this.r = r;
        this.c = c;
      }

      add(v: Vector) {
        return new Vector(this.r + v.r, this.c + v.c);
      }

      toString() {
        return `${this.r} ${this.c}`;
      }
    }

    class Pattern {
      height: number;
      width: number;
      parts: Vector[];

      constructor(height: number, width: number, grid: string[]) {
        this.height = height;
        this.width = width;

        this.parts = [];
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            if (grid[r][c] === "*") {
              this.parts.push(new Vector(r, c));
            }
          }
        }
      }
    }

    class Grid {
      height: number;
      width: number;
      cells: string[];

      constructor(height: number, width: number, grid: string[]) {
        this.height = height;
        this.width = width;
        this.cells = grid.map((row) => row.slice());
      }

      getCell(pos: Vector) {
        return this.cells[pos.r][pos.c];
      }

      patternFits(origin: Vector, pattern: Pattern) {
        for (const pos of pattern.parts) {
          const gridPos = pos.add(origin);
          if (this.getCell(gridPos) === "#") return false;
        }
        return true;
      }
    }

    console.error(input);

    function parseGrid() {
      const [h, w] = readline().split(" ").map(Number);
      const rows: string[] = [];
      for (let r = 0; r < h; r++) {
        rows.push(readline());
      }
      return { h, w, rows };
    }

    function parse() {
      const { h: patternH, w: patternW, rows: patternRows } = parseGrid();
      const pattern = new Pattern(patternH, patternW, patternRows);

      const { h: gridH, w: gridW, rows: gridRows } = parseGrid();
      const grid = new Grid(gridH, gridW, gridRows);

      return { pattern, grid };
    }

    function printSolvedGrid(grid: Grid, pattern: Pattern, origin: Vector) {
      const patternToWorld: string[] = pattern.parts.map((pos) =>
        pos.add(origin).toString()
      );

      for (let r = 0; r < grid.height; r++) {
        let row = "";

        for (let c = 0; c < grid.width; c++) {
          const currentPos = new Vector(r, c);

          if (patternToWorld.includes(currentPos.toString())) {
            row += "*";
            continue;
          }

          row += grid.getCell(currentPos);
        }

        console.log(row);
      }
    }

    const { pattern, grid } = parse();

    const validOrigins: Vector[] = [];

    for (let r = 0; r < grid.height - pattern.height + 1; r++) {
      for (let c = 0; c < grid.width - pattern.width + 1; c++) {
        const origin = new Vector(r, c);
        if (grid.patternFits(origin, pattern)) {
          validOrigins.push(origin);
        }
      }
    }

    console.error(validOrigins);

    console.log(validOrigins.length);
    if (validOrigins.length === 1) {
      printSolvedGrid(grid, pattern, validOrigins[0]);
    }
  });

  return 0;
}

main();
