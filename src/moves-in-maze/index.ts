import { getTestCases } from "../lib/fs";
import type { TestCases } from "../types/TestCases";

/**
 * The main function that executes the program.
 * @returns A promise that resolves to 0 if the program completes successfully, or 1 if there is an error.
 */
async function main() {
  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    console.error(error);
    return 1;
  }

  const input = testCases[0][0];

  function readline() {
    const line = input.shift();
    if (!line) throw new Error("Unexpected end of input.");
    return line;
  }

  /**
   * Parses the input and returns an object containing the width, height, map, and start position.
   * @returns An object containing the width, height, map, and start position.
   */
  function parseInput() {
    const [w, h] = readline()
      .split(" ")
      .map((v) => parseInt(v));

    const map = new Map<string, { impassable: boolean }>();
    let start: string = "";
    for (let row = 0; row < h; row++) {
      const line = readline();
      for (let col = 0; col < w; col++) {
        const pos = `${row},${col}`;
        if (line[col] === "S") start = pos;
        map.set(pos, { impassable: line[col] === "#" });
      }
    }

    return { w, h, map, start };
  }

  /**
   * Checks if a move to the specified row and column is valid.
   * @param row - The row index.
   * @param col - The column index.
   * @returns True if the move is valid, false otherwise.
   * @throws Error if the destination is invalid.
   */
  function isValidMove(row: number, col: number) {
    const destination = map.get(`${row},${col}`);
    if (destination === undefined)
      throw new Error(`Invalid destination: "${row},${col}".`);

    return !map.get(`${row},${col}`)!.impassable;
  }

  /**
   * Wraps the given index within the specified length.
   * If the index is negative, it wraps around to the end of the length.
   * If the index is greater than or equal to the length, it wraps around to the beginning of the length.
   * @param i The index to wrap.
   * @param length The length to wrap the index within.
   * @returns The wrapped index.
   */
  function wrap(i: number, length: number) {
    if (i < 0) {
      return length + i;
    }
    if (i >= length) {
      return i % length;
    }
    return i;
  }

  /**
   * Returns an array of neighboring positions for a given position.
   * @param pos - The current position in the format "row,col".
   * @returns An array of neighboring positions in the format "row,col".
   */
  function getNeighbors(pos: string) {
    const [row, col] = pos.split(",").map((v) => parseInt(v));

    const neighbors: string[] = [];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const direction of directions) {
      const [dY, dX] = direction;
      const newY = wrap(row + dY, h);
      const newX = wrap(col + dX, w);
      if (isValidMove(newY, newX)) neighbors.push(`${newY},${newX}`);
    }

    return neighbors;
  }

  /**
   * Performs a breadth-first search to find all reachable positions in the maze from the start position.
   * Returns a map of positions and their distances from the start position.
   */
  function walk() {
    type Step = [string, number]; // position, distance from start
    const visited = new Map<string, number>();

    const queue: Step[] = [[start, 0]];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) throw new Error("Unexpected end of queue.");

      const [currentPosition, distance] = current;
      if (visited.has(currentPosition)) continue;
      visited.set(currentPosition, distance);

      const neighbors = getNeighbors(currentPosition);

      for (const neighbor of neighbors) {
        queue.push([neighbor, distance + 1]);
      }
    }

    return visited;
  }

  /**
   * Converts a number to a character.
   * If the number is less than 10, it returns the number as a string.
   * If the number is greater than or equal to 10, it returns the corresponding character using the ASCII code.
   * @param n - The number to convert.
   * @returns The converted character.
   */
  function getChar(n: number) {
    if (n < 10) return n.toString();
    return String.fromCharCode("A".charCodeAt(0) + n - 10);
  }

  /**
   * Draws the maze with visited positions marked as characters, impassable positions marked as '#', and free spaces as ".".
   */
  function draw() {
    for (let row = 0; row < h; row++) {
      let rowString = "";
      for (let col = 0; col < w; col++) {
        const pos = `${row},${col}`;
        if (visited.has(pos)) {
          rowString += getChar(visited.get(pos)!);
        } else {
          rowString += map.get(pos)!.impassable ? "#" : ".";
        }
      }
      console.log(rowString);
    }
  }

  const { w, h, map, start } = parseInput();
  const visited = walk();
  draw();

  return 0;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
