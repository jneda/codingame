import { getTestCases } from "../lib/fs";
import type { TestCases } from "../types/TestCases";

async function main() {
  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    return 1;
  }

  const input = testCases[0][0];

  function readline() {
    const line = input.shift();
    if (!line) throw new Error("Unexpected end of input.");
    return line;
  }

  /**
   * Parses the input from the user.
   * @returns {string[]} The pattern array.
   */
  function parseInput() {
    const n = parseInt(readline());
    const pattern: string[] = [];
    for (let i = 0; i < n; i++) {
      pattern.push(readline());
    }
    return pattern;
  }

  /**
   * Reverses a given string.
   * 
   * @param s - The string to be reversed.
   * @returns The reversed string.
   */
  function reverse(s: string) {
    return s.split("").reverse().join("");
  }

  /**
   * Builds a tile based on the given pattern.
   * @returns The constructed tile as an array of strings.
   */
  function buildTile() {
    const horizontalOpposites = {
      "(": ")",
      ")": "(",
      "{": "}",
      "}": "{",
      "[": "]",
      "]": "[",
      "<": ">",
      ">": "<",
      "/": "\\",
      "\\": "/",
    };

    const top: string[] = [];
    for (const quadrant of pattern) {
      const line = quadrant.concat(
        reverse(quadrant.slice(0, quadrant.length - 1)).replace(
          /[\(\)\{\}\[\]<>\\/]/g,
          (match) =>
            horizontalOpposites[match as keyof typeof horizontalOpposites]
        )
      );
      top.push(line);
    }
    
    const verticalOpposites = {
      "^": "v",
      v: "^",
      A: "V",
      V: "A",
      w: "m",
      m: "w",
      W: "M",
      M: "W",
      u: "n",
      n: "u",
      "/": "\\",
      "\\": "/",
    };

    const bottom = top
      .slice(0, top.length - 1)
      .reverse()
      .map((s) =>
        s.replace(
          /[\^vAVwmWMun\\/]/g,
          (match) => verticalOpposites[match as keyof typeof verticalOpposites]
        )
      );

    const tile = top.concat(bottom);

    return tile;
  }

  /**
   * Draws a floor using the provided tile.
   */
  function drawFloor() {
    const w = tile[0].length;
    const hr = `+${"-".repeat(w)}+${"-".repeat(w)}+`;
    for (let i = 0; i < 2; i++) {
      console.log(hr);
      for (const line of tile) {
        console.log(`|${line}|${line}|`);
      }
    }
    console.log(hr);
  }

  const pattern = parseInput();
  const tile = buildTile();
  drawFloor();

  return 0;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
