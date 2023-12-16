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

    type Plane = {
      position: number;
      altitude: number;
      direction: number;
    };

    type SAM = {
      position: number | null;
    };

    type Action = "WAIT" | "SHOOT";

    /**
     * Parses the input and returns an object containing the planes and SAM information.
     * @returns An object with the planes and SAM information.
     * @throws {Error} If SAM position is null.
     */
    function parseInput() {
      const planes: Plane[] = [];
      const sam: SAM = { position: null };
      const n = parseInt(readline());
      for (let row = n - 1; row >= 0; row--) {
        const rowString = readline();
        for (let col = 0; col < rowString.length; col++) {
          const char = rowString[col];
          if ("<>".includes(char)) {
            const plane = {
              position: col,
              altitude: row,
              direction: char === ">" ? 1 : -1,
            };
            planes.push(plane);
          }
          if (char === "^") {
            sam.position = col;
          }
        }
      }

      if (sam.position === null) {
        throw new Error("SAM position cannot be null.");
      }

      return { planes, sam };
    }

    /**
     * Checks if a plane is within shooting range.
     * @param plane - The plane to check.
     * @returns True if the plane is within shooting range, false otherwise.
     */
    function isInRange(plane: Plane) {
      const hDistance = Math.abs(plane.position - sam.position!);
      return hDistance === plane.altitude + 1;
    }

    /**
     * Runs the simulation to shoot down enemy aircraft.
     * @returns An array of actions performed during the simulation.
     */
    function run() {
      const history: Action[] = [];

      while (planes.length > 0) {
        let action: Action = "WAIT";
        for (const plane of planes) {
          if (isInRange(plane)) {
            action = "SHOOT";
            planes = planes.filter((otherPlane) => otherPlane !== plane);
            continue;
          }
          plane.position += plane.direction;
        }
        history.push(action);
      }

      return history;
    }

    let { planes, sam } = parseInput();
    // console.error(planes);
    // console.error(sam);

    const history = run();

    const expectedHistory = expected[index];
    console.assert(
      history.join("\n") === expectedHistory.join("\n"),
      `Expected: ${expectedHistory.join(",")}, got ${history.join(",")}`
    );

    console.log(history.join("\n"));
  });

  return 0;
}

main();
