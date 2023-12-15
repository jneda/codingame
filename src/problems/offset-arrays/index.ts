import { readFile } from "../../lib/fs";

type ArraysDictionary = { [k: string]: { [k: string]: number } };

/**
 * Builds arrays based on the given array assignments.
 * @param arrayAssignments - An array of string assignments in the format "id[start..end] = elts".
 * @returns An object containing the built arrays.
 * @throws Error if the data is invalid or if there is an unexpected end of array.
 */
function buildArrays(arrayAssignments: string[]) {
  const arrays: ArraysDictionary = {};

  const arrayRegex =
    /^(?<id>\w+)\[(?<start>-?\d+)..(?<end>-?\d+)\] = (?<elts>(-?\d+ ?)+)/;

  for (const assignment of arrayAssignments) {
    const match = assignment.match(arrayRegex);
    if (!match || !match.groups) throw new Error("Invalid data.");

    const { id, start, end, elts } = match.groups;
    const eltsArray = elts.split(" ").map((v) => Number.parseInt(v));

    const map: { [k: string]: number } = {};

    for (let j = Number.parseInt(start); j < Number.parseInt(end) + 1; j++) {
      const current = eltsArray.shift();
      if (current === undefined) throw new Error("Unexpected end of array");
      map[j] = current;
    }

    arrays[id] = map;
  }

  return arrays;
}

/**
 * Parses an instruction and retrieves the corresponding value from the arrays dictionary.
 * @param instruction - The instruction to parse.
 * @param arrays - The dictionary of arrays.
 * @returns The value retrieved from the arrays dictionary.
 * @throws Error if the instruction is invalid or if the data is invalid.
 */
function parse(instruction: string, arrays: ArraysDictionary): number {
  const instructionRegex = /^(?<arr>\w+)\[(?<idx>.+)\]$/;

  const match = instruction.match(instructionRegex);
  if (!match || !match.groups) throw new Error("Invalid data.");

  const { arr, idx } = match.groups;
  const index = Number.parseInt(idx);

  if (!isNaN(index)) return arrays[arr][idx];

  return arrays[arr][parse(idx, arrays)];
}

async function main() {
  const readline = await readFile(__dirname, "test.txt");
  const arrayAssignments: string[] = [];
  const n = Number.parseInt(readline());
  for (let i = 0; i < n; i++) {
    arrayAssignments.push(readline());
  }

  const arrays = buildArrays(arrayAssignments);

  const instruction = readline();
  const result = parse(instruction, arrays);

  console.log(result);
}

main();
