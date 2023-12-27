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

    function gcd(a: number, b: number) {
      if (b === 0) {
        return a;
      }

      const q = Math.floor(a / b);
      const r = a % b;

      console.log(`${a}=${b}*${q}+${r}`)

      return gcd(b, r);
    }

    function euclids(a: number, b: number) {
      const n = gcd(a, b);
      console.log(`GCD(${a},${b})=${n}`);
    }

    const [a, b] = readline().split(" ").map(Number);
    euclids(a, b);
  });

  return 0;
}

main();
