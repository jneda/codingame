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

    function parseInput() {
      let n = parseInt(readline());
      const properties: string[] = [];
      for (let i = 0; i < n; i++) {
        properties.push(readline());
      }
      n = parseInt(readline());
      const persons: Record<string, string>[] = [];
      for (let i = 0; i < n; i++) {
        const [name, ...rest] = readline().split(" ");
        const person: Record<string, string> = {};
        properties.forEach((prop, index) => (person[prop] = rest[index]));
        persons.push(person);
      }
      n = parseInt(readline());
      const queries: string[] = [];
      for (let i = 0; i < n; i++) {
        queries.push(readline());
      }
      return { persons, queries };
    }

    const { persons, queries } = parseInput();

    const results: number[] = [];

    for (const query of queries) {
      const subQueries = query.split(" AND ");
      let result = [...persons];

      for (const subQuery of subQueries) {
        const [prop, value] = subQuery.split("=");
        result = result.filter((person) => person[prop] === value);
      }

      results.push(result.length);
    }

    const expectedResults = expected[index].map((v) => parseInt(v));
    console.assert(results.every((v, i) => v === expectedResults[i]));

    console.log(results.join("\n"));
  });

  return 0;
}

main();
