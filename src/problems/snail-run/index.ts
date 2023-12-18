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

    type Vector = [number, number];

    type Snail = {
      speed: number;
      startPosition: Vector | null;
    };

    function parseInput() {
      const snailsCount = parseInt(readline());
      const snails: Record<string, Snail> = {};
      for (let i = 1; i <= snailsCount; i++) {
        const speed = parseInt(readline());
        snails[i] = { speed, startPosition: null };
      }

      const gridHeight = parseInt(readline());
      const gridWidth = parseInt(readline());

      const goals: Vector[] = [];
      for (let r = 0; r < gridHeight; r++) {
        const row = readline();
        for (let c = 0; c < gridWidth; c++) {
          const char = row[c];
          if (char === "*") continue;
          if (char === "#") {
            goals.push([r, c]);
            continue;
          }
          snails[char].startPosition = [r, c];
        }
      }

      return { snails, goals };
    }

    function manhattanDistance(a: Vector, b: Vector) {
      return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    function findMinDist(snail: Snail, goals: Vector[]) {
      if (!snail.startPosition)
        throw new Error("Snail should have a start position.");

      let minDist = Infinity;

      for (const goal of goals) {
        const dist = manhattanDistance(snail.startPosition, goal);
        if (dist < minDist) {
          minDist = dist;
        }
      }

      return minDist;
    }

    function runRace() {
      let minTime = Infinity;
      let winner: string | null = null;

      for (const snailId in snails) {
        const snail = snails[snailId];
        const minDist = findMinDist(snail, goals);
        const timeToGoal = minDist / snail.speed;

        if (timeToGoal < minTime) {
          minTime = timeToGoal;
          winner = snailId;
        }
      }

      if (!winner) throw new Error("There must be a winner.");

      return winner;
    }

    const { snails, goals } = parseInput();
    const winner = runRace();

    const expectedWinner = expected[index][0];

    console.assert(winner === expectedWinner);
  });

  return 0;
}

main();
