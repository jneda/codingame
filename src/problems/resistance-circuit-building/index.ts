// https://www.codingame.com/ide/puzzle/equivalent-resistance-circuit-building
import { getTestCases } from "../../lib/fs";
import type { TestCases } from "../../types/TestCases";

type ResistorDictionary = Record<string, number>;
type Brackets = "[" | "]" | "(" | ")";
type StackElements = Brackets | number;

/**
 * Parses the input and returns a tuple containing the resistance dictionary and the circuit.
 * @param input - The input array containing the number of resistors, resistor values, and the circuit.
 * @returns A tuple containing the resistance dictionary and the circuit.
 */
function parseInput(input: string[]): [ResistorDictionary, string] {
  const n = Number.parseInt(input.shift()!);
  const dict: ResistorDictionary = {};
  for (let i = 0; i < n; i++) {
    const [k, v] = input.shift()!.split(" ");
    dict[k] = Number.parseInt(v);
  }
  const circuit = input.shift()!;

  return [dict, circuit];
}

/**
 * Calculates the sum of the given numbers.
 * @param args - The numbers to be summed.
 * @returns The sum of the numbers.
 */
function sum(...args: number[]) {
  return args.reduce((a, b) => a + b);
}

/**
 * Calculates the inverse sum of the given numbers.
 *
 * @param args - The numbers to calculate the inverse sum of.
 * @returns The inverse sum of the given numbers.
 */
function inverseSum(...args: number[]) {
  let total = 0;
  for (const arg of args) total += 1 / arg;
  return 1 / total;
}

// Using a Stack to Evaluate an Expression: https://faculty.cs.niu.edu/~hutchins/csci241/eval.htm
/**
 * Parses a circuit string and calculates the total resistance.
 * @param circuit - The circuit string to parse.
 * @param dict - The resistance dictionary containing resistance values for circuit elements.
 * @returns The total resistance of the circuit.
 */
function parseCircuit(circuit: string, dict: ResistorDictionary) {
  const elts = circuit.split(" ").map((elt) => {
    return Object.keys(dict).includes(elt) ? dict[elt] : elt;
  });
  const stack: StackElements[] = [];

  for (const elt of elts) {
    if (typeof elt === "number" || elt === "[" || elt === "(") {
      stack.push(elt);
    }
    if (elt === ")" || elt === "]") {
      let f = elt === ")" ? sum : inverseSum;

      let current = stack.pop();
      let operands: number[] = [];
      while (typeof current === "number") {
        operands.push(current);
        current = stack.pop();
      }
      stack.push(f(...operands));
    }
  }

  return (stack.pop() as number).toFixed(1);
}

async function main() {
  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "tests.txt");
  } catch (error) {
    console.error(error);
    return 1;
  }

  const inputs = testCases[0];
  const expected = testCases[1].map(([x]) => x);

  inputs.forEach((input, index) => {
    const [dict, circuit] = parseInput(input);
    const result = parseCircuit(circuit, dict);
    console.log({ actual: result, expected: expected[index] });
  });

  return 0;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
