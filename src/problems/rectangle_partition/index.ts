import { getTestCases } from "../../lib/fs";

/**
 * Parses the input array and returns an object containing the width and height splits.
 * 
 * @param input - The input array containing the width, height, and splits.
 * @returns An object with the width and height splits.
 */
function parseInput(input: string[]) {
  const splitToNumbers = (s: string) =>
    s.split(" ").map((v) => Number.parseInt(v));
  const [w, h] = splitToNumbers(input[0]);
  const wSplits = [...splitToNumbers(input[1]), w];
  const hSplits = [...splitToNumbers(input[2]), h];

  return { wSplits, hSplits };
}

/**
 * Calculates the count of segments formed by the given splits.
 * @param splits - An array of numbers representing the splits.
 * @returns An object containing the count of each segment.
 */
function getSegments(splits: number[]) {
  const segmentCounts: { [k: string]: number } = {};

  for (let i = splits.length - 1; i >= 0; i--) {
    const split = splits[i];
    if (!segmentCounts[split]) segmentCounts[split] = 0;
    segmentCounts[split] = segmentCounts[split] + 1;

    for (let j = i - 1; j >= 0; j--) {
      const segment = split - splits[j];
      if (!segmentCounts[segment]) segmentCounts[segment] = 0;
      segmentCounts[segment] = segmentCounts[segment] + 1;
    }
  }

  return segmentCounts;
}

/**
 * Counts the number of squares formed by partitioning a rectangle.
 * 
 * @param input - An array of strings representing the rectangle partition.
 * @returns The total number of squares formed by the partition.
 */
export function countSquares(input: string[]) {
  const { wSplits, hSplits } = parseInput(input);
  const subWidthCounts = getSegments(wSplits);
  const subHeightCounts = getSegments(hSplits);

  const subWidths = Object.keys(subWidthCounts);
  const subHeights = Object.keys(subHeightCounts);

  const commonDimensions =
    subWidths.length > subHeights.length
      ? subWidths.filter((w) => subHeights.includes(w))
      : subHeights.filter((h) => subWidths.includes(h));

  let total = 0;
  for (const dimension of commonDimensions) {
    total += subWidthCounts[dimension] * subHeightCounts[dimension];
  }

  return total;
}

async function main() {
  let testCases: [string[][], string[][]];
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    console.error(error);
    return 1;
  }

  const [inputs, expected] = testCases;

  inputs.forEach((input, index) => {
    const total = countSquares(input);
    console.log({ actual: total, expected: expected[index] });
  });

  return 0;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
