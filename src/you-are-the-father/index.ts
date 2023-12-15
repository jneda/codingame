import { getTestCases } from "../lib/fs";
import type { TestCases } from "../types/TestCases";

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

    function parseLine(): [string, string[]] {
      const line = readline();
      const match = line.match(/([\w ]+): +(.+)/);
      if (!match) throw new Error(`Invalid data: ${line}`);

      const [, name, chromosomeString] = match;
      return [name, chromosomeString.split(" ")];
    }

    function getChildsChromosomes() {
      readline();
      const [, childs] = parseLine();
      return childs;
    }

    function getCandidates() {
      const n = parseInt(readline());
      const candidates: [string, string[]][] = [];
      for (let i = 0; i < n; i++) {
        const [name, chromPairs] = parseLine();
        candidates.push([name, chromPairs]);
      }
      return candidates;
    }

    function findFather() {
      const [father] = candidates
        .filter(([, chromPairs]) => {
          return chromPairs.every((chromPair, index) => {
            const currentChilds = childsChromos[index].split("");
            return currentChilds.some((c) => chromPair.includes(c));
          });
        })
        .map(([name]) => name);
      return father;
    }

    const childsChromos = getChildsChromosomes();
    const candidates = getCandidates();
    const father = findFather();

    const answer = `${father}, you are the father!`;

    const expectedAnswer = expected[index][0];
    console.assert(
      answer === expectedAnswer,
      `Expected "${expectedAnswer}", got "${answer}"`
    );

    console.log(answer);
  });

  return 0;
}

main();
