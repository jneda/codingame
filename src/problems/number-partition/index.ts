// https://www.codingame.com/ide/puzzle/number-partition

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

    // https://www.geeksforgeeks.org/generate-unique-partitions-of-an-integer/
    function generatePartitions(n: number) {
      const partitions: number[][] = [];
      const partition = [n];
      let lastIndex = 0;

      while (true) {
        partitions.push(partition.slice(0, lastIndex + 1));

        // find rightmost value greater than 1
        // keep count of the total of values encountered while searching
        let remainder = 0;
        while (partition[lastIndex] >= 0 && partition[lastIndex] === 1) {
          remainder += partition[lastIndex];
          lastIndex--;
        }

        // if lastIndex < 0, all values were 1s, whe have finished
        if (lastIndex < 0) return partitions;

        // decrease rightmost value, update remainder
        const rightmost = partition[lastIndex] - 1;
        partition[lastIndex] = rightmost;
        remainder++;

        // if remainder ends up being greater than rightmost value,
        // divide remainder as many times as needed
        while (remainder > rightmost) {
          partition[lastIndex + 1] = rightmost;
          remainder -= rightmost;
          lastIndex++;
        }

        // add remainder in last index
        partition[lastIndex + 1] = remainder;
        lastIndex++;
      }
    }

    const n = parseInt(readline());
    const partitions = generatePartitions(n);
    const result = partitions
      .map((partition) => partition.join(" "))
      .join("\n");

    const expectedResult = expected[index].join("\n");
    console.assert(result === expectedResult, `Failed test for n=${n}.`);

    // console.log(result);
  });

  return 0;
}

main();
