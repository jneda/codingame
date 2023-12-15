// https://www.codingame.com/ide/puzzle/crop-circles

export type Operation = "mow" | "plant" | "plantmow";

const WIDTH = 19;
const HEIGHT = 25;

/**
 * Calculates the quantized distance between two points in a 2D plane.
 *
 * @param ax The x-coordinate of the first point.
 * @param ay The y-coordinate of the first point.
 * @param bx The x-coordinate of the second point.
 * @param by The y-coordinate of the second point.
 * @returns The quantized distance between the two points.
 */
export function getQuantizedDistance(
  ax: number,
  ay: number,
  bx: number,
  by: number
) {
  return Math.round(Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2)));
}

/**
 * Returns an array of cell positions that form a circle given the center position and diameter.
 * @param pos - The center position of the circle in the format "row,col".
 * @param diameter - The diameter of the circle.
 * @returns An array of cell positions that form the circle.
 */
export function getCircleCells(pos: string, diameter: number) {
  const [centerRow, centerCol] = pos.split(",").map((v) => parseInt(v));
  const radius = Math.floor(diameter / 2);
  // clamp top left and bottom right coordinates
  const topleft = [
    Math.min(centerRow - radius, 0),
    Math.min(centerCol - radius, 0),
  ];
  const bottomright = [
    Math.min(centerRow + radius, HEIGHT - 1),
    Math.min(centerCol + radius, WIDTH - 1),
  ];

  const circleCells: string[] = [];

  for (let row = topleft[0]; row <= bottomright[0]; row++) {
    for (let col = topleft[1]; col <= bottomright[1]; col++) {
      const distanceToCenter = getQuantizedDistance(
        centerCol,
        centerRow,
        col,
        row
      );
      if (distanceToCenter <= radius) {
        circleCells.push(`${row},${col}`);
      }
    }
  }

  return circleCells;
}

/**
 * Gets the position of a cell on a grid.
 * @param pos - The position of the cell in the format "colrow", where col is a letter and row is a number.
 * @returns The position of the cell in the format "row,col", where row and col are numbers.
 */
function getPosition(pos: string) {
  const [col, row] = pos.split("");
  const toNum = (s: string) => s.charCodeAt(0) - "a".charCodeAt(0);
  return `${toNum(row)},${toNum(col)}`;
}

/**
 * Parses the given instruction and returns an array containing the operation, position, and diameter.
 *
 * @param instruction - The instruction to parse.
 * @returns An array containing the operation, position, and diameter.
 */
export function parseInstruction(
  instruction: string
): [Operation, string, number] {
  let op: Operation = "mow";
  let posIndex = 0;
  if (instruction.startsWith("PLANTMOW")) {
    op = "plantmow";
    posIndex = "PLANTMOW".length;
  } else if (instruction.startsWith("PLANT")) {
    op = "plant";
    posIndex = "PLANT".length;
  }
  const position = instruction.slice(posIndex, posIndex + 2);
  const diameter = parseInt(instruction.slice(posIndex + 2));
  return [op, getPosition(position), diameter];
}

/**
 * Initializes a map with default values.
 * @returns A Map object with string keys and number values.
 */
function initMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      map.set(`${row},${col}`, 1);
    }
  }
  return map;
}

/**
 * Draws the map based on the provided map data.
 * @param map - The map data represented as a Map object.
 */
function draw(map: Map<string, number>) {
  for (let row = 0; row < HEIGHT; row++) {
    let rowString = "";
    for (let col = 0; col < WIDTH; col++) {
      rowString += map.get(`${row},${col}`) === 1 ? "{}" : "  ";
    }
    console.log(rowString);
  }
}

/**
 * The main function that executes the crop circles algorithm.
 */
function main() {
  // const input = "fg9 ls11 oe7";
  // const input = "ee7 ou7 eu7 oe7 jm7 dm5 pm5";
  const input = "ft17 PLANTft9 nf17 PLANTnf9 PLANTjm5";
  const map = initMap();
  for (const instruction of input.split(" ")) {
    const [op, pos, diameter] = parseInstruction(instruction);
    const circleCells = getCircleCells(pos, diameter);
    for (const cell of circleCells) {
      if (op === "mow") {
        map.set(cell, 0);
      } else if (op === "plant") {
        map.set(cell, 1);
      } else if (op === "plantmow") {
        map.set(cell, map.get(cell) === 1 ? 0 : 1);
      }
    }
  }
  draw(map);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
