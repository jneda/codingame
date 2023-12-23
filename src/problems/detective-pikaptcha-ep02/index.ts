//https://www.codingame.com/ide/puzzle/detective-pikaptcha-ep2
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

    type Direction = [0, 1] | [1, 0] | [0, -1] | [-1, 0];
    type Position = [number, number];

    function getInitialDirection(char: string) {
      let initialDir: Direction | null = null;

      switch (char) {
        case ">": {
          initialDir = [0, 1];
          break;
        }
        case "v": {
          initialDir = [1, 0];
          break;
        }
        case "<": {
          initialDir = [0, -1];
          break;
        }
        case "^": {
          initialDir = [-1, 0];
          break;
        }
        default: {
          throw new Error(`Invalid character: ${char}.`);
        }
      }

      return initialDir;
    }

    function turnLeft(direction: Direction) {
      const dirString = JSON.stringify(direction);
      const turns: Record<string, Direction> = {
        "[0,1]": [-1, 0],
        "[-1,0]": [0, -1],
        "[0,-1]": [1, 0],
        "[1,0]": [0, 1],
      };
      return turns[dirString];
    }

    function turnRight(direction: Direction) {
      const dirString = JSON.stringify(direction);
      const turns: Record<string, Direction> = {
        "[0,1]": [1, 0],
        "[1,0]": [0, -1],
        "[0,-1]": [-1, 0],
        "[-1,0]": [0, 1],
      };
      return turns[dirString];
    }

    function getTile(pos: Position) {
      const tile = grid.get(JSON.stringify(pos));
      if (tile === undefined) throw new Error(`Invalid position: ${pos}.`);
      return tile;
    }

    function isInBounds(pos: Position) {
      const [r, c] = pos;
      return 0 <= c && c < width && 0 <= r && r < height;
    }

    function isWall(pos: Position) {
      if (!isInBounds(pos)) return true;
      return getTile(pos) === "#";
    }

    function doesFollowWall(pos: Position, dir: Direction, rule: string) {
      const wallDir = rule === "L" ? turnLeft(dir) : turnRight(dir);
      return isWall(getNexPos(pos, wallDir));
    }

    function getNexPos(pos: Position, dir: Direction): Position {
      return [pos[0] + dir[0], pos[1] + dir[1]];
    }

    function isTrapped(pos: Position) {
      for (const dir of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ] as Direction[]) {
        const neighbor = getNexPos(pos, dir);
        if (!isWall(neighbor)) return false;
      }
      return true;
    }

    function parse() {
      const [width, height] = readline().split(" ").map(Number);

      const grid = new Map<string, string>();
      let startPos: Position | null = null;
      let initialDir: Direction | null = null;

      for (let r = 0; r < height; r++) {
        const row = readline();
        for (let c = 0; c < width; c++) {
          const char = row[c];
          grid.set(JSON.stringify([r, c]), char);

          if (">v<^".includes(char)) {
            startPos = [r, c];
            initialDir = getInitialDirection(char);
          }
        }
      }

      if (!startPos) throw new Error("Could not find starting position.");
      if (!initialDir)
        throw new Error("Could not determine initial direction.");

      const rule = readline();

      return {
        width,
        height,
        grid,
        initialDir,
        startPos,
        rule,
      };
    }

    const { width, height, grid, initialDir, startPos, rule } = parse();

    // for (let r = 0; r < height; r++) {
    //   let row = "";
    //   for (let c = 0; c < width; c++) {
    //     row += grid.get(JSON.stringify([r, c]));
    //   }
    //   console.log(row);
    // }

    // console.log({ initialDir, startPos, rule });

    const visited = new Map<string, number>();
    let currentDir = initialDir;
    let currentPos = startPos;
    while (true) {
      if (isTrapped(currentPos)) break;

      if (!doesFollowWall(currentPos, currentDir, rule)) {
        currentDir =
          rule === "L" ? turnLeft(currentDir) : turnRight(currentDir);
      }

      const nextPos = getNexPos(currentPos, currentDir);

      if (isWall(nextPos)) {
        currentDir =
          rule === "L" ? turnRight(currentDir) : turnLeft(currentDir);
        continue;
      }

      currentPos = nextPos;

      const posString = JSON.stringify(currentPos);
      if (!visited.has(posString)) {
        visited.set(posString, 1);
      } else {
        const visitsCount = visited.get(posString)!;
        visited.set(posString, visitsCount + 1);
      }
      
      if (JSON.stringify(currentPos) === JSON.stringify(startPos)) break;
    }

    for (let r = 0; r < height; r++) {
      let row = "";
      for (let c = 0; c < width; c++) {
        const posString = JSON.stringify([r, c]);
        if (visited.has(posString)) {
          row += visited.get(posString)!.toString();
          continue;
        }
        row += grid.get(posString)!;
      }
      console.log(row);
    }
  });

  return 0;
}

main();
