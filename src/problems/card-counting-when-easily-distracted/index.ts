import { getTestCases } from "../../lib/fs";
import type { TestCases } from "../../types/TestCases";

async function main() {
  let testCases: TestCases;
  try {
    testCases = await getTestCases(__dirname, "test.txt");
  } catch (error) {
    console.error(error);
    return 0;
  }

  const [inputs, expected] = testCases;

  const input = inputs[0];

  function readline() {
    const line = input.shift();
    if (!line) throw new Error("Unexpected end of input.");
    return line;
  }

  type Face =
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "T"
    | "J"
    | "Q"
    | "K"
    | "A";

  /**
   * Checks if a given string represents a face card.
   * @param s - The string to check.
   * @returns A boolean indicating whether the string is a face card.
   */
  function isFace(s: string): s is Face {
    return [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "T",
      "J",
      "Q",
      "K",
      "A",
    ].includes(s);
  }

  /**
   * Checks if a string is valid, i.e. is only made of Face characters.
   * @param s - The string to be checked.
   * @returns A boolean indicating whether the string is valid or not.
   */
  function isValid(s: string) {
    return s.split("").every((c) => isFace(c));
  }

  /**
   * Initializes a deck of cards.
   * @returns The initialized deck.
   */
  function initDeck() {
    const deck: Record<Face, number> = {
      "2": 4,
      "3": 4,
      "4": 4,
      "5": 4,
      "6": 4,
      "7": 4,
      "8": 4,
      "9": 4,
      T: 4,
      J: 4,
      Q: 4,
      K: 4,
      A: 4,
    };
    return deck;
  }

  /**
   * Parses the input from the stream and returns the deck and bust threshold.
   * @returns An object containing the deck and bust threshold.
   */
  function parseInput() {
    const stream = readline();
    const deck = initDeck();
    stream
      .split(".")
      .filter((s) => isValid(s))
      .forEach((s) => {
        for (const f of s.split("") as Face[]) {
          const previousCount = deck[f];
          if (previousCount - 1 < 0)
            throw new Error(`Trying too remove one ${f} too many.`);
          deck[f] = previousCount - 1;
        }
      });
    const bustThreshold = parseInt(readline());
    return { deck, bustThreshold };
  }

  /**
   * Computes the odds of busting in a card game.
   * 
   * @returns The odds of busting as a percentage.
   */
  function computeOdds() {
    const cardValues: Record<Face, number> = {
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      T: 10,
      J: 10,
      Q: 10,
      K: 10,
      A: 1,
    };

    const remainingCardsValues: number[] = [];
    Object.entries(deck).map(([face, count]) => {
      if (count > 0) {
        remainingCardsValues.push(
          ...Array(count).fill(cardValues[face as Face])
        );
      }
    });

    const odds = Math.round(
      (remainingCardsValues.filter((v) => v < bustThreshold).length /
        remainingCardsValues.length) *
        100
    );

    return `${odds}%`;
  }

  const { deck, bustThreshold } = parseInput();
  console.log(computeOdds());

  return 1;
}

if (process.env.NODE_ENV !== "test") {
  main();
}
