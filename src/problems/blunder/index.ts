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
       * Creates a Vector object from a string representation.
       *
       * @param s - The string representation of the vector in the format "r,c".
       * @returns A new Vector object.
       */
      static fromString(s: string) {
        const [r, c] = s.split(",").map(Number);
        return new Vector(r, c);
      }

      /**
       * Creates a new instance of the Vector class.
       * @param r The value for the 'r' property.
       * @param c The value for the 'c' property.
       */
      constructor(r: number, c: number) {
        this.r = r;
        this.c = c;
      }

      /**
       * Returns a string representation of the object.
       * The string is formatted as "{row},{column}".
       * @returns A string representation of the object.
       */
      toString() {
        return `${this.r},${this.c}`;
      }

      /**
       * Adds a vector to the current vector.
       * @param v - The vector to be added.
       * @returns A new vector that is the result of the addition.
       */
      add(v: Vector) {
        return new Vector(this.r + v.r, this.c + v.c);
      }

      /**
       * Checks if the current vector is equal to the given vector.
       * @param v The vector to compare with.
       * @returns True if the vectors are equal, false otherwise.
       */
      equals(v: Vector) {
        return this.r === v.r && this.c === v.c;
      }
    }

    /**
     * Represents a grid with tiles and positions.
     */
    class Grid {
      // tile types
      static tileTypes = {
        "#": "#",
        X: "X",
        "@": "@",
        $: "$",
        S: "S",
        E: "E",
        N: "N",
        W: "W",
        B: "B",
        I: "I",
        T: "T",
        " ": " ",
      };

      // tile map
      tiles = new Map<string, string>();

      // positions
      startPosition!: Vector;
      endPosition!: Vector;
      teleporters?: Vector[];

      /**
       * Constructs a new instance of the Grid class.
       * @param w The width of the grid.
       * @param h The height of the grid.
       * @param rows The rows of the grid.
       */
      constructor(w: number, h: number, rows: string[]) {
        for (let r = 0; r < h; r++) {
          for (let c = 0; c < w; c++) {
            const tile = rows[r][c];
            // store relevant tiles in the tiles map property
            if (Object.keys(Grid.tileTypes).includes(tile)) {
              const pos = new Vector(r, c);
              this.tiles.set(pos.toString(), tile);

              // store special positions in their own properties
              switch (tile) {
                case "@": {
                  this.startPosition = pos;
                  break;
                }
                case "$": {
                  this.endPosition = pos;
                  break;
                }
                case "T": {
                  if (this.teleporters === undefined) {
                    this.teleporters = [pos];
                  } else {
                    this.teleporters.push(pos);
                  }
                  break;
                }
                default: {
                  continue;
                }
              }
            }
          }
        }
      }

      /**
       * Retrieves the tile at the specified position.
       * @param pos The position of the tile.
       * @returns The tile at the specified position.
       * @throws Error if the position is invalid.
       */
      get(pos: Vector) {
        const tile = this.tiles.get(pos.toString());
        if (tile === undefined)
          throw new Error(`Invalid position: [${pos.toString()}].`);
        return tile;
      }

      /**
       * Destroys the tile at the specified position.
       * Throws an error if the tile is not destructible.
       * @param pos The position of the tile to destroy.
       */
      destroy(pos: Vector) {
        const tile = this.get(pos);
        if (tile !== Grid.tileTypes["X"]) {
          throw new Error(
            `Tile ${tile} at [${pos.toString()}] is not destructible.`
          );
        }
        this.tiles.set(pos.toString(), Grid.tileTypes[" "]);
      }
    }

    type BotSnapshot = {
      dir: number;
      inverted: boolean;
      breakerMode: boolean;
    };

    type EndFoundResult = {
      moves: number[];
    };

    type LoopFoundResult = {
      isLooping: boolean;
    };

    type SearchResult = Partial<EndFoundResult & LoopFoundResult>;

    /**
     * Represents a Bot in the game.
     */
    class Bot {
      // orientation related static properties
      static turnSequence = [
        new Vector(1, 0),
        new Vector(0, 1),
        new Vector(-1, 0),
        new Vector(0, -1),
      ];
      static SOUTH = 0;
      static EAST = 1;
      static NORTH = 2;
      static WEST = 3;

      // position and direction
      pos: Vector;
      dir: number;

      // status properties
      inverted = false;
      breakerMode = false;

      // history of moves as directions followed
      history: number[] = [];
      // log of state snapshots for loop detection
      statesLog = new Map<string, BotSnapshot[]>();

      // flag to help handle turning
      hasTurned = false;

      /**
       * Creates a new instance of the Bot class.
       * @param pos The position of the bot.
       * @param dir The direction of the bot.
       */
      constructor(pos: Vector, dir: number) {
        this.pos = pos;
        this.dir = dir;
      }

      /**
       * Moves the bot on the grid and handles various scenarios such as collisions, obstacle destruction, teleporters, loop detection, and reaching the end.
       * @param grid The grid on which the bot is moving.
       * @returns The search result which includes the moves history, loop detection result, or indication of not looping.
       */
      move(grid: Grid): SearchResult {
        let newPos = this.pos.add(Bot.turnSequence[this.dir]);
        let tile = grid.get(newPos);

        // handle collisions
        while (this.isObstacle(tile)) {
          this.turn();
          newPos = this.pos.add(Bot.turnSequence[this.dir]);
          tile = grid.get(newPos);
        }

        // handle obstacle destruction
        if (tile === "X" && this.breakerMode) {
          grid.destroy(newPos);
          // since the grid has changed, reset states log
          this.statesLog = new Map<string, BotSnapshot[]>();
        }

        // handle teleporters
        if (tile === "T") {
          const otherTeleporter = grid.teleporters!.find(
            (t) => t.toString() !== newPos.toString()
          )!;
          newPos = otherTeleporter;
        }

        // actual movement
        this.pos = newPos;

        // loop detection
        const hasLoop = this.checkForLoop(newPos);
        if (hasLoop) return hasLoop;

        // update moves history and turn flag
        this.history.push(this.dir);
        this.hasTurned = false;

        // if we reached the end, return moves history
        if (tile === "$") {
          return { moves: this.history };
        }

        // handle status changes
        this.handleStatusChange(tile);

        // since neither loop nor end are found
        return { isLooping: false };
      }

      /**
       * Checks if a tile is an obstacle.
       * @param tile - The tile to check.
       * @returns True if the tile is an obstacle, false otherwise.
       */
      isObstacle(tile: string) {
        return tile === "#" || (tile === "X" && !this.breakerMode);
      }

      /**
       * Changes the direction of the bot based on the current state.
       */
      turn() {
        switch (this.inverted) {
          case false: {
            if (!this.hasTurned) {
              this.dir = Bot.SOUTH;
              this.hasTurned = true;
            } else {
              this.dir = (this.dir + 1) % 4;
            }
            break;
          }
          case true: {
            if (!this.hasTurned) {
              this.dir = Bot.WEST;
              this.hasTurned = true;
            } else {
              this.dir = (((this.dir - 1) % 4) + 4) % 4; // handle negative modulo
            }
          }
        }
      }

      /**
       * Checks for a loop in the bot's movement history based on the given position.
       * If a loop is detected, it returns an object indicating that a loop is present.
       * Otherwise, it updates the bot's movement history with the current state snapshot.
       * @param newPos - The new position to check for a loop.
       * @returns An object indicating whether a loop is present or not.
       */
      checkForLoop(newPos: Vector) {
        const logHasPos = this.statesLog.has(newPos.toString());

        /**
         * Creates a log entry for the bot.
         * @returns {BotSnapshot} The log entry containing the current state of the bot.
         */
        const makeLogEntry = (): BotSnapshot => ({
          dir: this.dir,
          inverted: this.inverted,
          breakerMode: this.breakerMode,
        });

        if (!logHasPos) {
          // if position is not yet known, initialize an array with current state
          this.statesLog.set(newPos.toString(), [makeLogEntry()]);
        } else {
          /**
           * Checks if the given BotSnapshot matches the current bot state.
           * @param entry - The BotSnapshot to check.
           * @returns True if the BotSnapshot matches the current bot state, false otherwise.
           */
          const isLooping = (entry: BotSnapshot) => {
            const { dir, inverted, breakerMode } = entry;
            return (
              dir === this.dir &&
              inverted === this.inverted &&
              breakerMode === this.breakerMode
            );
          };

          // get state snapshots for this position
          const entries = this.statesLog.get(newPos.toString());
          if (entries === undefined)
            throw new Error(
              `Unable to access log entries for [${newPos.toString()}].`
            );

          for (const entry of entries) {
            // if state repeats, a loop is detected, and we get out
            if (isLooping(entry)) {
              return { isLooping: true };
            }
          }

          // otherwise, append current state snapshot to the entry array
          entries.push(makeLogEntry());
        }
      }

      /**
       * Handles the status change based on the given tile.
       * @param tile - The tile representing the status change.
       */
      handleStatusChange(tile: string) {
        switch (tile) {
          case "S": {
            this.dir = Bot.SOUTH;
            break;
          }
          case "E": {
            this.dir = Bot.EAST;
            break;
          }
          case "N": {
            this.dir = Bot.NORTH;
            break;
          }
          case "W": {
            this.dir = Bot.WEST;
            break;
          }
          case "I": {
            this.inverted = !this.inverted;
            break;
          }
          case "B": {
            this.breakerMode = !this.breakerMode;
            break;
          }
        }
      }
    }

    /**
     * Parses the input and returns a new Grid object.
     *
     * @returns {Grid} The parsed Grid object.
     */
    function parse(): Grid {
      const [h, w] = readline().split(" ").map(Number);
      const rows = Array.from({ length: h }, (_) => readline());

      return new Grid(w, h, rows);
    }

    /**
     * Formats the search result by converting the moves into their corresponding directions.
     * If there are no moves, it returns "LOOP".
     * @param searchResult - The search result object.
     * @returns The formatted string representation of the search result.
     */
    function formatSearchResult(searchResult: SearchResult) {
      return searchResult.moves
        ? searchResult.moves
            .map((m) => {
              switch (m) {
                case 0:
                  return "SOUTH";
                case 1:
                  return "EAST";
                case 2:
                  return "NORTH";
                case 3:
                  return "WEST";
              }
            })
            .join("\n")
        : "LOOP";
    }

    const grid = parse();

    const bot = new Bot(grid.startPosition, Bot.SOUTH);

    let searchResult: SearchResult = { isLooping: false };
    while (!searchResult.isLooping && !searchResult.moves) {
      searchResult = bot.move(grid);
    }

    const formattedMoves = formatSearchResult(searchResult);

    console.log(formattedMoves);

    console.assert(formattedMoves === expected[index].join("\n"));
    console.log();
  });

  return 0;
}

main();
