// https://www.codingame.com/training/easy/sum-of-spirals-diagonals
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
    type Direction = [0, 1] | [1, 0] | [0, -1] | [-1, 0] | [1, 1] | [-1, 1];
    const directions: Direction[] = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    let currentDirectionIndex = 0;

    function getNextDirection() {
      currentDirectionIndex = (currentDirectionIndex + 1) % 4;
      return directions[currentDirectionIndex];
    }

    function move(pos: Position, dir: Direction): Position {
      return [pos[0] + dir[0], pos[1] + dir[1]];
    }

    function buildSpiral(size: number) {
      const spiral = new Map<string, number>();
      let currentPos: Position = [0, -1];
      let currentNumber = 0;
      currentDirectionIndex = 0;
      let currentDirection = directions[currentDirectionIndex];

      for (let i = 0; i < size; i++) {
        currentNumber++;
        currentPos = move(currentPos, currentDirection);
        spiral.set(JSON.stringify(currentPos), currentNumber);
      }
      size--;

      while (size > 0) {
        for (let i = 0; i < 2; i++) {
          currentDirection = getNextDirection();
          for (let s = 0; s < size; s++) {
            currentNumber++;
            currentPos = move(currentPos, currentDirection);
            spiral.set(JSON.stringify(currentPos), currentNumber);
          }
        }
        size--;
      }

      return spiral;
    }

    function getLine(
      start: Position,
      dir: Direction,
      spiral: Map<string, number>
    ) {
      const line: number[] = [];
      for (let i = 0; i < size; i++) {
        const cell = spiral.get(
          JSON.stringify([start[0] + i * dir[0], start[1] + i * dir[1]])
        )!;
        line.push(cell);
      }
      return line;
    }

    function getTotal(spiral: Map<string, number>) {
      const downward = getLine([0, 0], [1, 1], spiral);
      const upward = getLine([size - 1, 0], [-1, 1], spiral);
      const combined = Array.from(new Set(downward.concat(upward)));
      const sum = (a: number, b: number) => a + b;
      return combined.reduce(sum);
    }

    function formatCell(n: number) {
      return n.toString().padStart(3, " ");
    }

    function printSpiral(spiral: Map<string, number>) {
      for (let r = 0; r < size; r++) {
        let rowString = "";
        for (let c = 0; c < size; c++) {
          const cellValue = spiral.get(JSON.stringify([r, c]))!;
          rowString += formatCell(cellValue);
        }
        console.log(rowString);
      }
    }

    const size = Number(readline());
    const spiral = buildSpiral(size);
    const total = getTotal(spiral);

    const expectedTotal = Number(expected[index][0]);
    console.assert(total === expectedTotal, `${total} does not match ${expectedTotal}.`);

    console.log(total);
  });

  return 0;
}

main();
