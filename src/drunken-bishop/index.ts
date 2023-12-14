type Board = Map<string, number>;
type Step = "00" | "01" | "10" | "11";

const WIDTH = 17;
const HEIGHT = 9;
const START = "8,4";

const tileDictionary: Record<string, string> = {
  "0": " ",
  "1": ".",
  "2": "o",
  "3": "+",
  "4": "=",
  "5": "*",
  "6": "B",
  "7": "O",
  "8": "X",
  "9": "@",
  "10": "%",
  "11": "&",
  "12": "#",
  "13": "/",
  "14": "^",
};

const input = "fc:94:b0:c1:e5:b0:98:7c:58:43:99:76:97:ee:9f:b7";

/**
 * Converts a hexadecimal string to a binary string.
 * 
 * @param hex - The hexadecimal string to convert.
 * @returns The binary representation of the hexadecimal string.
 */
function hexToBin(hex: string) {
  return parseInt(hex, 16).toString(2).padStart(8, "0");
}

/**
 * Checks if a string is a valid step.
 * @param s - The string to check.
 * @returns True if the string is a valid step, false otherwise.
 */
function isStep(s: string): s is Step {
  return s === "00" || s === "01" || s === "10" || s === "11";
}

/**
 * Builds an array of steps from a hexadecimal string array.
 * Each step is represented by a 2-character string.
 * Throws an error if an invalid step is encountered.
 * 
 * @param hex - The hexadecimal string array.
 * @returns An array of steps.
 * @throws Error if an invalid step is encountered.
 */
function buildSteps(hex: string[]) {
  const steps: Step[] = [];
  hex.forEach((h) => {
    const bin = hexToBin(h);
    for (let i = bin.length - 2; i >= 0; i -= 2) {
      const step = bin.slice(i, i + 2);
      if (!isStep(step)) throw new Error(`Invalid step: ${step}`);
      steps.push(step);
    }
  });
  return steps;
}

/**
 * Initializes the board with all cells set to 0.
 * @returns {Map<string, number>} The initialized board.
 */
function initBoard(): Map<string, number> {
  const board = new Map<string, number>();
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      board.set(`${x},${y}`, 0);
    }
  }
  return board;
}

/**
 * Prints the board with the given end position.
 * @param board - The board to be printed.
 * @param end - The end position on the board.
 */
function printBoard(board: Board, end: string) {
  console.log("+---[CODINGAME]---+");
  for (let y = 0; y < HEIGHT; y++) {
    let row = "";
    for (let x = 0; x < WIDTH; x++) {
      const pos = `${x},${y}`;
      const tile =
        pos === START
          ? "S"
          : pos === end
          ? "E"
          : tileDictionary[board.get(pos)! % 15];

      row += tile;
    }
    console.log(`|${row}|`);
  }
  console.log("+-----------------+");
}

/**
 * Returns the direction of a step based on the given step value.
 * @param step - The step value.
 * @returns An array representing the direction of the step.
 */
function getStepDirection(step: Step) {
  return step === "00"
    ? [-1, -1]
    : step === "01"
    ? [1, -1]
    : step === "10"
    ? [-1, 1]
    : [1, 1];
}

/**
 * Moves the current position based on the given step.
 * @param current - The current position in the format "x,y".
 * @param step - The step to move in.
 * @returns The new position after the move in the format "x,y".
 */
function move(current: string, step: Step) {
  const [x, y] = current.split(",").map((v) => parseInt(v));
  const [dx, dy] = getStepDirection(step);

  let [newX, newY] = [x + dx, y + dy];
  if (newX < 0 || newX >= WIDTH) newX = x;
  if (newY < 0 || newY >= HEIGHT) newY = y;

  return `${newX},${newY}`;
}

/**
 * Walks through the steps on the board and updates the visit count for each position.
 * 
 * @param steps - The array of steps to walk through.
 * @param board - The board to update the visit count on.
 * @returns The final position after walking through all the steps.
 */
function walk(steps: Step[], board: Board) {
  let current = START;
  for (const step of steps) {
    current = move(current, step);
    const visitCount = board.get(current)!;
    board.set(current, visitCount + 1);
  }
  return current;
}

function main() {
  const hexSteps = input.split(":");
  const steps = buildSteps(hexSteps);
  const board = initBoard();
  const end = walk(steps, board);
  printBoard(board, end);
}

main();
