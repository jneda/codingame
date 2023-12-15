// https://www.codingame.com/ide/puzzle/abcdefghijklmnopqrstuvwxyz
import { getTestCases } from "../../lib/fs";
import type { TestCases } from "../../types/TestCases";

(async function main() {
  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    console.error(error);
    return 1;
  }

  const [input] = testCases[0];

  function readline() {
    const line = input.shift();
    if (!line) throw new Error("Unexpected end of input.");
    return line;
  }

  /**
   * Parses the input and returns an object containing the grid and starting positions.
   * @returns An object with the grid and starting positions.
   */
  function parseInput() {
    const n = parseInt(readline());
    const grid: string[] = [];
    const starts: string[] = [];
    for (let row = 0; row < n; row++) {
      const line = readline();
      for (let col = 0; col < n; col++) {
        if (line[col] === "a") starts.push(`${row},${col}`);
      }
      grid.push(line);
    }
    return { grid, starts };
  }

  /**
   * Returns the next character in the alphabet after the given character.
   * @param s - The current character.
   * @returns The next character in the alphabet.
   */
  function getNext(s: string) {
    return String.fromCharCode(s.charCodeAt(0) + 1);
  }

  /**
   * Retrieves the character at the specified position in the grid.
   * @param pos The position in the format "row,col".
   * @returns The character at the specified position.
   */
  function getCharAt(pos: string) {
    const [row, col] = pos.split(",").map((v) => parseInt(v));
    return grid[row][col];
  }

  /**
   * Returns an array of neighboring positions for a given position.
   * @param pos - The position in the format "row,col".
   * @returns An array of neighboring positions.
   */
  function getNeighbors(pos: string) {
    const [row, col] = pos.split(",").map((v) => parseInt(v));
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const neighbors: string[] = [];
    for (const [dY, dX] of directions) {
      const newY = row + dY;
      const newX = col + dX;
      if (0 <= newY && newY < grid.length && 0 <= newX && newX < grid.length) {
        neighbors.push(`${newY},${newX}`);
      }
    }
    return neighbors;
  }

  /**
   * Walks through the alphabet starting from the given character and returns a map of characters visited.
   * @param start The starting character.
   * @returns A map of characters visited, where the key is the character's position and the value is the character itself.
   * If the character 'z' is reached, the function will stop and return the map.
   * If the next character cannot be found in the neighbors, the function will stop and return null.
   */
  function walk(start: string) {
    const path = new Map<string, string>();
    let current = start;

    while (true) {
      const currentChar = getCharAt(current);
      path.set(current, currentChar);
      if (currentChar === "z") return path;

      const next = getNext(currentChar);
      const neighbors = getNeighbors(current);
      let isNextFound = false;

      for (const neighbor of neighbors) {
        if (getCharAt(neighbor) === next) {
          isNextFound = true;
          current = neighbor;
        }
      }
      if (!isNextFound) return null;
    }
  }

  /**
   * Draws the grid with the given path.
   *
   * @param path - A map representing the path with positions as keys and values as characters.
   */
  function draw(path: Map<string, string>) {
    for (let row = 0; row < grid.length; row++) {
      let rowString = "";
      for (let col = 0; col < grid.length; col++) {
        const pos = `${row},${col}`;
        rowString += path.get(pos) !== undefined ? path.get(pos) : "-";
      }
      console.log(rowString);
    }
  }

  const { grid, starts } = parseInput();
  for (const start of starts) {
    const path = walk(start);
    if (path) {
      draw(path);
      break;
    }
  }

  return 0;
})();
