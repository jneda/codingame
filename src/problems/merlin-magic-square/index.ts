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

    const buttonEffects: Record<number, number[]> = {
      /**
       * 123
       * 456
       * 789
       */
      1: [1, 2, 4, 5],
      2: [1, 2, 3],
      3: [2, 3, 5, 6],
      4: [1, 4, 7],
      5: [2, 4, 5, 6, 8],
      6: [3, 6, 9],
      7: [4, 5, 7, 8],
      8: [7, 8, 9],
      9: [5, 6, 8, 9],
    };

    function parseInput() {
      const board = new Map<number, boolean>();
      for (let row = 0; row < 3; row++) {
        const rowChars = readline()
          .split("")
          .filter((c) => c !== " "); // fix weird behavior with "~"
        for (let col = 0; col < 3; col++) {
          const char = rowChars[col];
          const button = row * 3 + (col + 1);
          board.set(button, char === "*" ? true : false);
        }
      }

      const buttons = readline()
        .split("")
        .map((v) => parseInt(v));

      return { board, buttons };
    }

    function pressButton(button: number) {
      for (const effect of buttonEffects[button]) {
        const current = board.get(effect)!;
        board.set(effect, !current);
      }
    }

    function getWinningBoard() {
      const board = new Map<number, boolean>();
      for (let i = 1; i < 10; i++) {
        board.set(i, i !== 5);
      }
      return board;
    }

    function getWinningMove() {
      // first find the differences with the winning state
      const winningBoard = getWinningBoard();
      const diff: number[] = [];
      for (const [button, value] of board.entries()) {
        if (board.get(button) !== winningBoard.get(button)) {
          diff.push(button);
        }
      }

      // then find the corresponding button
      let winningMove = 0;
      for (const [button, effects] of Object.entries(buttonEffects)) {
        if (
          effects.length === diff.length &&
          effects.every((x) => diff.includes(x))
        ) {
          winningMove = parseInt(button);
          break;
        }
      }

      return winningMove;
    }

    const { board, buttons } = parseInput();

    for (const button of buttons) {
      pressButton(button);
    }

    const winningMove = getWinningMove();

    const expectedMove = parseInt(expected[index][0]);
    console.assert(winningMove === expectedMove);

    console.log(winningMove);
  });

  return 0;
}

main();
