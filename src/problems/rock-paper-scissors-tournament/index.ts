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

    type Choice = "Rock" | "Paper" | "Scissors";

    function isChoice(s: string): s is Choice {
      return s === "Rock" || s === "Paper" || s === "Scissors";
    }

    function parse() {
      const n = Number(readline());
      const players: Choice[] = [];
      for (let i = 0; i < n; i++) {
        const choice = readline();
        if (!isChoice(choice)) throw new Error(`Invalid string: ${choice}.`);
        players.push(choice);
      }

      return players;
    }

    function getWinningChoice(other: Choice) {
      const winningChoices: Record<Choice, Choice> = {
        Rock: "Paper",
        Paper: "Scissors",
        Scissors: "Rock",
      };

      return winningChoices[other];
    }

    function evaluateChoice(startIndex: number) {
      const choice = getWinningChoice(players[startIndex]);
      let score = 1;
      console.error(
        `Playing winning choice ${choice} versus player #${startIndex}: ${players[startIndex]}.`
      );

      for (let i = 1; i < players.length; i++) {
        const current = (i + startIndex) % players.length;
        console.error(
          `Evaluating choice ${choice} versus player #${current}: ${players[current]}.`
        );
        if (players[current] === getWinningChoice(choice)) break;
        if (choice === getWinningChoice(players[current])) score++;
      }

      return { score, choice };
    }

    const players = parse();
    let maxScore = -Infinity;
    let bestChoice: Choice | null = null;
    let bestIndex: number | null = null;
    for (let i = 0; i < players.length; i++) {
      const { score, choice } = evaluateChoice(i);
      console.log(`Final score: ${score}.`);
      if (score > maxScore) {
        maxScore = score;
        (bestChoice = choice), (bestIndex = i);
      }
    }

    if (bestIndex === null) throw new Error(`Unable to find best index.`);
    if (bestChoice === null) throw new Error(`Unable to find best choice.`);

    console.log(`${bestChoice}\n${bestIndex}`);
  });

  return 0;
}

main();
