// https://www.codingame.com/ide/puzzle/logic-gates
import { getTestCases } from "../lib/fs";
import type { TestCases } from "../types/TestCases";

async function main() {
  type GateType = "AND" | "OR" | "XOR" | "NAND" | "NOR" | "NXOR";

  /**
   * Checks if a given string is a valid gate type.
   * @param s - The string to check.
   * @returns True if the string is a valid gate type, false otherwise.
   */
  function isGateType(s: string): s is GateType {
    return ["AND", "OR", "XOR", "NAND", "NOR", "NXOR"].includes(s);
  }

  type Gate = {
    type: GateType;
    left: string;
    right: string;
  };

  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    console.error(error);
    return 1;
  }

  const [[input], [expected]] = testCases;

  function readline() {
    const line = input.shift();
    if (!line) throw new Error("Unexpected end of input.");
    return line;
  }

  /**
   * Parses the input from the standard input and returns the signals and gates.
   * @returns A tuple containing the signals and gates.
   */
  function parseInput(): [Record<string, string>, Record<string, Gate>] {
    const signalsCount = parseInt(readline());
    const gatesCount = parseInt(readline());

    const signals: Record<string, string> = {};
    for (let i = 0; i < signalsCount; i++) {
      const [label, signal] = readline().split(" ");
      signals[label] = signal;
    }

    const gates: Record<string, Gate> = {};
    for (let i = 0; i < gatesCount; i++) {
      const [label, type, left, right] = readline().split(" ");
      if (!isGateType(type)) throw new Error(`Invalid gate type: ${type}`);
      gates[label] = { type, left, right };
    }

    return [signals, gates];
  }

  /**
   * Calculates the output of a logic gate based on the input values and gate type.
   * @param l - The left input value.
   * @param r - The right input value.
   * @param type - The type of logic gate.
   * @returns The output of the logic gate.
   * @throws Error if an invalid gate type is provided.
   */
  function getOutput(l: string, r: string, type: GateType) {
    switch (type) {
      case "AND":
        return l === "-" && r === "-";
      case "OR":
        return l === "-" || r === "-";
      case "XOR":
        return !(l === "-" && r === "-") && (l === "-" || r === "-");
      case "NAND":
        return !(l === "-" && r === "-");
      case "NOR":
        return !(l === "-" || r === "-");
      case "NXOR":
        return !(!(l === "-" && r === "-") && (l === "-" || r === "-"));
      default:
        throw new Error(`Invalid gate type: $${type}`);
    }
  }

  const [signals, gates] = parseInput();

  const outputs: string[] = [];

  for (const [label, gate] of Object.entries(gates)) {
    const left = signals[gate.left];
    const right = signals[gate.right];
    let output = "";

    for (let t = 0; t < left.length; t++) {
      const l = left[t];
      const r = right[t];
      output += getOutput(l, r, gate.type) ? "-" : "_";
    }

    outputs.push(`${label} ${output}`);
  }

  for (const output of outputs) {
    console.log(output);
  }

  return 0;
}

main();
