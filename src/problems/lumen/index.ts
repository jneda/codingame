import { readFile } from "../../lib/fs";

/**
 * Reads data from a file and returns an object containing room size, candles, and light level.
 * @returns An object with roomSize, candles, and lightLevel.
 */
async function getData() {
  const readline = await readFile(__dirname, "test.txt");

  const roomSize = Number.parseInt(readline());
  const lightLevel = Number.parseInt(readline());
  const candles: string[] = [];
  for (let r = 0; r < roomSize; r++) {
    const line = readline().replace(/ /g, "");
    for (let c = 0; c < roomSize; c++) {
      if (line[c] === "C") {
        candles.push(`${r},${c}`);
      }
    }
  }

  return { roomSize, candles, lightLevel };
}

/**
 * Initializes a light map with the specified room size.
 * @param roomSize - The size of the room.
 * @returns A Map object representing the light map.
 */
function initializeLightMap(roomSize: number) {
  const lightMap = new Map<string, number>();
  for (let r = 0; r < roomSize; r++) {
    for (let c = 0; c < roomSize; c++) {
      lightMap.set(`${r},${c}`, 0);
    }
  }
  return lightMap;
}

/**
 * Checks if a position is within the bounds of a room.
 * @param pos - The position in the format "row,column".
 * @param roomSize - The size of the room (number of rows/columns).
 * @returns True if the position is within the bounds, false otherwise.
 */
function isInBounds(pos: string, roomSize: number) {
  const [r, c] = pos.split(",").map((v) => Number.parseInt(v));
  return 0 <= r && r < roomSize && 0 <= c && c < roomSize;
}

/**
 * Returns an array of neighboring positions for a given position in a room.
 * @param pos - The position in the format "row,column".
 * @param roomSize - The size of the room.
 * @returns An array of neighboring positions.
 */
function getNeighbors(pos: string, roomSize: number) {
  const [r, c] = pos.split(",").map((v) => Number.parseInt(v));
  const neighbors: string[] = [];
  const directions: [number, number][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, -1],
    [0, 1],
  ];
  directions.forEach(([dR, dC]) => {
    const neighbor = `${r + dR},${c + dC}`;
    if (isInBounds(neighbor, roomSize)) neighbors.push(neighbor);
  });
  return neighbors;
}

/**
 * Propagates the light from a candle to adjacent positions in a room.
 *
 * @param candle - The position of the candle.
 * @param lightLevel - The initial light level of the candle.
 * @param lightMap - A map representing the light levels at different positions in the room.
 * @param roomSize - The size of the room.
 */
function propagate(
  candle: string,
  lightLevel: number,
  lightMap: Map<string, number>,
  roomSize: number
) {
  const queue: [string, number][] = [[candle, lightLevel]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) throw new Error("Unexpected end of queue.");

    const [currentPos, currentLightLevel] = current;
    if (!isInBounds(currentPos, roomSize)) continue;
    if (currentLightLevel === 0) continue;

    if (visited.has(currentPos)) continue;
    visited.add(currentPos);

    if (!lightMap.has(currentPos))
      throw new Error(`Invalid position: ${currentPos}`);

    if (lightMap.get(currentPos)! < currentLightLevel)
      lightMap.set(currentPos, currentLightLevel);

    for (const neighbor of getNeighbors(currentPos, roomSize)) {
      queue.push([neighbor, currentLightLevel - 1]);
    }
  }
}

/**
 * Builds a light map display based on the given light map and room size.
 * @param lightMap - The light map containing the brightness values for each position in the room.
 * @param roomSize - The size of the room.
 * @returns An array of strings representing the light map display.
 */
function buildLightMapDisplay(lightMap: Map<string, number>, roomSize: number) {
  const lightMapDisplay: string[] = [];
  for (let r = 0; r < roomSize; r++) {
    let row: string = "";
    for (let c = 0; c < roomSize; c++) {
      row += lightMap.get(`${r},${c}`);
    }
    lightMapDisplay.push(row);
  }
  return lightMapDisplay;
}

/**
 * The main function that executes the logic of the program.
 * It retrieves data, initializes the light map, propagates light from candles,
 * calculates the number of dark spots, and returns the count.
 * @returns The number of dark spots in the room.
 */
async function main() {
  let data;
  try {
    data = await getData();
  } catch (error) {
    console.error(error);
    return 1;
  }
  const { roomSize, candles, lightLevel } = data;
  const lightMap = initializeLightMap(roomSize);

  for (const candle of candles) {
    propagate(candle, lightLevel, lightMap, roomSize);
  }

  const lightMapDisplay = buildLightMapDisplay(lightMap, roomSize);
  console.log(lightMapDisplay.join("\n"));

  const darkSpotsCount = Array.from(lightMap)
    .map(([pos, lightLevel]) => lightLevel)
    .filter((v) => v === 0).length;

  return darkSpotsCount;
}

main().then((result) => console.log(result));
