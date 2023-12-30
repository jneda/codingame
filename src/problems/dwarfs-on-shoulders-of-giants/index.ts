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

    /**
     * Parses the input and returns the roots and adjacencies of the graph.
     * @returns An object containing the roots and adjacencies of the graph.
     * @throws Error if unable to find the root node.
     */
    function parse() {
      const adjacencies: Record<number, number[]> = {};

      const n = Number(readline());
      for (let i = 0; i < n; i++) {
        const [parent, child] = readline().split(" ").map(Number);
        if (adjacencies[parent] === undefined) adjacencies[parent] = [];
        adjacencies[parent].push(child);
      }

      const roots: number[] = [];

      for (const node of Object.keys(adjacencies).map(Number)) {
        let isRoot = true;
        for (const list of Object.values(adjacencies)) {
          if (list.includes(node)) {
            isRoot = false;
            break;
          }
        }
        if (isRoot) roots.push(node);
      }

      if (roots.length === 0) throw new Error("Unable to find root node.");

      return { roots, adjacencies };
    }

    /**
     * Explores the graph starting from a given node and calculates the maximum path length.
     * @param current The current node to explore.
     * @param adjacencies The adjacency list representing the graph.
     * @param max The maximum path length found so far (default: 0).
     * @param pathLength The length of the current path (default: 0).
     * @returns The maximum path length.
     */
    function explore(
      current: number,
      adjacencies: Record<number, number[]>,
      max = 0,
      pathLength = 0
    ) {
      pathLength++;

      const children = adjacencies[current];
      if (children === undefined) {
        return pathLength;
      }

      for (const child of children) {
        max = Math.max(max, explore(child, adjacencies, max, pathLength));
      }

      return max;
    }

    const { roots, adjacencies } = parse();

    console.info({ roots, adjacencies });

    let max = 0;
    for (const root of roots) {
      max = Math.max(max, explore(root, adjacencies));
    }

    console.log(max);

    const expectedMax = Number(expected[index][0]);
    console.assert(max === expectedMax);
  });

  return 0;
}

main();

// non recursive algorithm

// const stack = [root];

// while (stack.length > 0) {
//   const current = stack.pop();
//   if (current === undefined) throw new Error("Unexpected end of stack.");
//   pathLength++;

//   const children = adjacencies[current];
//   if (children === undefined) {
//     if (pathLength > max) max = pathLength;
//     pathLength = 0;
//     continue;
//   }

//   for (const child of children) {
//     stack.push(child);
//   }
// }
