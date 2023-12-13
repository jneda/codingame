import { readFile } from "../lib/fs";

type CardValue =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";
type Deck = string[];
type Result = "1" | "2" | "PAT";

const cardValues = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function buildDeck(readline: () => string) {
  const deckSize = Number.parseInt(readline());
  if (isNaN(deckSize)) throw new Error("Invalid data.");

  const deck: string[] = [];
  for (let i = 0; i < deckSize; i++) {
    deck.push(readline());
  }

  return deck;
}

export function buildDecks(readline: () => string) {
  const deckA = buildDeck(readline);
  const deckB = buildDeck(readline);
  return [deckA, deckB];
}

function playRound(deckA: string[], deckB: string[]) {
  if (deckA.length === 0) return "2";
  if (deckB.length === 0) return "1";

  let cardA = deckA.shift()!;
  let cardB = deckB.shift()!;

  let valueA = cardA.slice(0, -1) as CardValue;
  let valueB = cardB.slice(0, -1) as CardValue;

  if (cardValues[valueA] > cardValues[valueB]) {
    deckA.push(cardA, cardB);
    return null;
  } else if (cardValues[valueB] > cardValues[valueA]) {
    deckB.push(cardA, cardB);
    return null;
  }

  // play war

  const stashA: string[] = [];
  const stashB: string[] = [];

  while (valueA === valueB) {
    stashA.push(cardA);
    stashB.push(cardB);

    for (let i = 0; i < 3; i++) {
      if (deckA.length === 0 || deckB.length === 0) {
        return "PAT";
      }
      cardA = deckA.shift()!;
      cardB = deckB.shift()!;
      stashA.push(cardA);
      stashB.push(cardB);
    }

    if (deckA.length === 0 || deckB.length === 0) {
      return "PAT";
    }

    cardA = deckA.shift()!;
    cardB = deckB.shift()!;

    let valueA = cardA.slice(0, -1) as CardValue;
    let valueB = cardB.slice(0, -1) as CardValue;

    if (cardValues[valueA] > cardValues[valueB]) {
      deckA.push(...stashA, cardA, ...stashB, cardB);
      return null;
    } else if (cardValues[valueB] > cardValues[valueA]) {
      deckB.push(...stashA, cardA, ...stashB, cardB);
      return null;
    }
  }
}

export function playGame(deckA: string[], deckB: string[]) {
  let gameResult = null;
  let rounds = 0;
  while (!gameResult) {
    gameResult = playRound(deckA, deckB);
    if (!gameResult) rounds++;
  }
  return gameResult === "PAT" ? "PAT" : `${gameResult} ${rounds}`;
}

async function main() {
  const readline = await readFile(__dirname, "test.txt");

  const [deckA, deckB] = buildDecks(readline);
  const result = playGame(deckA, deckB);
  console.log(result);
}

if (process.env.NODE_ENV !== "test") {
  main();
}
