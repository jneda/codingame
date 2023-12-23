// https://www.codingame.com/training/easy/longest-coast
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

    type Position = [number, number];

    function parse() {
      const size = Number(readline());
      const grid = new Map<string, string>();
      for (let r = 0; r < size; r++) {
        const row = readline();
        for (let c = 0; c < row.length; c++) {
          grid.set(JSON.stringify([r, c]), row[c]);
        }
      }

      return { size, grid };
    }

    function isWater(pos: Position) {
      return grid.get(JSON.stringify(pos)) === "~";
    }

    function isInBounds(pos: Position) {
      const [r, c] = pos;
      return 0 <= c && c < size && 0 <= r && r < size;
    }

    function getNeighbors(pos: Position) {
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      const neighbors: Position[] = [];
      let waterTiles = new Set<string>();

      for (const dir of directions) {
        const neighborPos: Position = [pos[0] + dir[0], pos[1] + dir[1]];
        if (!isInBounds(neighborPos)) continue;
        if (isWater(neighborPos)) {
          waterTiles.add(JSON.stringify(neighborPos));
          continue;
        }
        neighbors.push(neighborPos);
      }

      return { neighbors, waterTiles };
    }

    function exploreGrid() {
      const islands = new Map<number, Set<string>>();

      const visited = new Set<string>();
      let islandsCount = 0;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          let currentPos: Position = [r, c];
          if (isWater(currentPos)) continue;
          if (visited.has(JSON.stringify(currentPos))) continue;

          islandsCount++;
          islands.set(islandsCount, new Set<string>());
          const stack = [currentPos];

          // explore island
          while (stack.length > 0) {
            const topPos = stack.pop();
            if (topPos === undefined)
              throw new Error("Unexpected end of stack.");

            currentPos = topPos;
            if (visited.has(JSON.stringify(currentPos))) continue;

            visited.add(JSON.stringify(currentPos));

            const { neighbors, waterTiles } = getNeighbors(currentPos);

            const currentWaterTiles = islands.get(islandsCount);
            if (currentWaterTiles === undefined)
              throw new Error(`Invalid island id: ${islandsCount}.`);

            waterTiles.forEach((tile) => currentWaterTiles.add(tile));

            for (const neighbor of neighbors) {
              stack.push(neighbor);
            }
          }
        }
      }

      return islands;
    }

    const { size, grid } = parse();
    const islands = exploreGrid();

    let maxWaterCount = -Infinity;
    let longestCoast = null;
    for (const [islandId, waterTiles] of islands.entries()) {
      const waterCount = waterTiles.size;
      if (waterCount > maxWaterCount) {
        maxWaterCount = waterCount;
        longestCoast = islandId;
      }
    }

    if (!longestCoast)
      throw new Error("Unable to find island with the longest coast.");

    const answer = `${longestCoast} ${maxWaterCount}`;
    const expectedAnswer = expected[index][0];

    console.assert(
      answer === expectedAnswer,
      `${answer} does not match expected: ${expectedAnswer}.`
    );

    console.log(answer);
  });

  return 0;
}

main();
