// https://www.codingame.com/training/easy/a-childs-play
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

    /**
     * Represents a vector with row and column coordinates.
     */
    class Vector {
      r: number;
      c: number;

      /**
       * Creates a new Vector instance.
       * @param r The row coordinate. Default is 0.
       * @param c The column coordinate. Default is 0.
       */
      constructor(r = 0, c = 0) {
        this.r = r;
        this.c = c;
      }

      /**
       * Adds the given vector to this vector and returns a new Vector instance.
       * @param v The vector to add.
       * @returns A new Vector instance representing the sum of the two vectors.
       */
      add(v: Vector) {
        return new Vector(this.r + v.r, this.c + v.c);
      }

      /**
       * Checks if this vector is equal to the given vector.
       * @param v The vector to compare.
       * @returns True if the vectors are equal, false otherwise.
       */
      equals(v: Vector) {
        return this.r === v.r && this.c === v.c;
      }
    }

    /**
     * Represents a grid with tiles.
     */
    class Grid {
      w: number;
      h: number;
      rows: string[];

      /**
       * Creates a new Grid instance.
       * @param w The width of the grid.
       * @param h The height of the grid.
       * @param rows The rows of the grid.
       */
      constructor(w: number, h: number, rows: string[]) {
        this.w = w;
        this.h = h;
        this.rows = rows.slice();
      }

      /**
       * Checks if a tile at the specified position is passable.
       * @param position The position of the tile.
       * @returns True if the tile is passable, false otherwise.
       */
      isTilePassable(position: Vector) {
        return this.rows[position.r][position.c] !== "#";
      }
    }

    /**
     * Represents a bot in the game.
     */
    class Bot {
      pos: Vector;
      dir: Vector;

      /**
       * Creates a new instance of the Bot class.
       * @param pos The initial position of the bot.
       * @param dir The initial direction of the bot.
       */
      constructor(pos = new Vector(0, 0), dir = new Vector(-1, 0)) {
        this.pos = pos;
        this.dir = dir;
      }

      /**
       * Turns the bot 90 degrees clockwise.
       * @returns The new direction of the bot.
       */
      turn() {
        if (this.dir.equals(new Vector(1, 0))) {
          return (this.dir = new Vector(0, -1));
        }
        if (this.dir.equals(new Vector(0, -1))) {
          return (this.dir = new Vector(-1, 0));
        }
        if (this.dir.equals(new Vector(-1, 0))) {
          return (this.dir = new Vector(0, 1));
        }
        if (this.dir.equals(new Vector(0, 1))) {
          return (this.dir = new Vector(1, 0));
        }
      }

      /**
       * Have the bot turn to the right until it can reach a passable tile,
       * then move it there.
       * @param grid The grid representing the game world.
       */
      move(grid: Grid) {
        let newPos = this.pos.add(this.dir);
        while (!grid.isTilePassable(newPos)) {
          this.turn();
          newPos = this.pos.add(this.dir);
        }
        this.pos = newPos;
      }
    }
    
    /**
     * Simulates the Tortoise and Hare algorithm on a grid starting from a given position.
     * The algorithm detects cycles in the grid by moving two bots, a turtle and a hare, at different speeds.
     * It returns information about the detected cycle, including the cycle length, the number of steps to reach the cycle start,
     * the cycle start position, and the cycle start direction.
     *
     * @param grid The grid on which to perform the algorithm.
     * @param startPos The starting position of the bots.
     * @returns An object containing information about the detected cycle.
     */
    function tortoiseAndHare(grid: Grid, startPos: Vector) {
      let turtle = new Bot(startPos);
      const hare = new Bot(startPos);

      let cycleLength = 0;

      do {
        turtle.move(grid);
        hare.move(grid);
        hare.move(grid);
        cycleLength++;
      } while (!turtle.pos.equals(hare.pos));

      turtle = new Bot(startPos);
      let stepsToCycleStart = 0;

      while (!turtle.pos.equals(hare.pos)) {
        turtle.move(grid);
        hare.move(grid);
        stepsToCycleStart++;
      }

      const cycleStartPos = new Vector(hare.pos.r, hare.pos.c);
      const cycleStartDir = new Vector(hare.dir.r, hare.dir.c);

      return { cycleLength, stepsToCycleStart, cycleStartPos, cycleStartDir };
    }

    /**
     * Parses the input and returns an object containing the grid, start position, and operations count.
     * @returns An object with the parsed data.
     */
    function parse() {
      const [w, h] = readline().split(" ").map(Number);
      const opsCount = Number(readline());

      const rows: string[] = [];
      let startPos = new Vector();

      for (let r = 0; r < h; r++) {
        const row = readline().split("");
        for (let c = 0; c < w; c++) {
          if (row[c] === "O") {
            startPos = new Vector(r, c);
            row[c] = ".";
          }
        }
        rows.push(row.join(""));
      }

      const grid = new Grid(w, h, rows);

      return { grid, startPos, opsCount };
    }

    const { grid, startPos, opsCount } = parse();

    const { cycleLength, stepsToCycleStart, cycleStartPos, cycleStartDir } =
      tortoiseAndHare(grid, startPos);

    const stepsLeft = (opsCount - stepsToCycleStart) % cycleLength;

    const bot = new Bot(
      new Vector(cycleStartPos.r, cycleStartPos.c),
      new Vector(cycleStartDir.r, cycleStartDir.c)
    );

    for (let t = 0; t < stepsLeft; t++) {
      bot.move(grid);
    }
    console.log(`${bot.pos.c} ${bot.pos.r}`);
  });

  return 0;
}

main();
