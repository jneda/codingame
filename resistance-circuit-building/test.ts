import { describe, test, expect } from "@jest/globals";

const inputs = [
  ["2", "A 20", "B 10", "( A B )"],
  ["2", "C 20", "D 25", "[ C D ]"],
  ["3", "A 24", "B 8", "C 48", "[ ( A B ) [ C A ] ]"],
  [
    "7",
    "Alfa 1",
    "Bravo 1",
    "Charlie 12",
    "Delta 4",
    "Echo 2",
    "Foxtrot 10",
    "Golf 8",
    "( Alfa [ Charlie Delta ( Bravo [ Echo ( Foxtrot Golf ) ] ) ] )",
  ],
  [
    "3",
    "Alef 30",
    "Bet 20",
    "Vet 10",
    "( Alef [ ( Bet Bet Bet ) ( Vet [ ( Vet Vet ) ( Vet [ Bet Bet ] ) ] ) ] )",
  ],
  [
    "1",
    "Star 78",
    "[ ( [ Star ( Star Star ) ] [ Star ( Star Star ) ] Star ) ( [ Star ( Star Star ) ] [ Star ( Star Star ) ] Star ) ]",
  ],
];

const expected = ["30.0", "11.1", "10.7", "2.4", "45.0", "91.0"];
