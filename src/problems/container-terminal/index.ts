// https://www.codingame.com/ide/puzzle/ukuleleguitar-converter
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

    function readInputs() {
      const n = Number(readline());
      const schedules: string[][] = [];
      for (let i = 0; i < n; i++) {
        const schedule = readline().split("");
        schedules.push(schedule);
      }

      return schedules;
    }

    function process(schedule: string[]) {
      const stacks: string[][] = [];
      while (schedule.length > 0) {
        const container = schedule.shift();
        if (container === undefined) throw new Error(`Unexpected end of schedule.`);

        let stacked = false;
        for (const stack of stacks) {
          if (stack[stack.length - 1] >= container) {
            stack.push(container);
            stacked = true;
            break;
          }
        }

        if (!stacked) {
          stacks.push([container]);
        }
      }

      return stacks;
    }

    const schedules = readInputs();
    const expectedCounts = expected[index].map(Number);
    
    for (let i = 0; i < schedules.length; i++) {
      const stacks = process(schedules[i]);
      
      console.assert(stacks.length === expectedCounts[i]);

      console.error(stacks);
      console.log(stacks.length);
    }
  });

  return 0;
}

main();
