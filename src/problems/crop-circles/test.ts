import { describe, test, expect } from "@jest/globals";
import { getCircleCells, parseInstruction } from ".";
import type { Operation } from ".";

describe("getCircleCells", () => {
  describe("given a position of 0,0 and a diameter of 3", () => {
    test("it should return the correct array of positions", () => {
      const pos = "0,0";
      const d = 3;
      const expected = [
        "-1,-1",
        "-1,0",
        "-1,1",
        "0,-1",
        "0,0",
        "0,1",
        "1,-1",
        "1,0",
        "1,1",
      ];
      const actual = getCircleCells(pos, d);
      expect(new Set(actual)).toEqual(new Set(expected));
    });
  });

  describe("given a position of 0,0 and a diameter of 5", () => {
    test("it should return the correct array of positions", () => {
      const pos = "0,0";
      const d = 5;
      const expected = [
        "-1,-1",
        "-1,-2",
        "-1,0",
        "-1,1",
        "-1,2",
        "-2,-1",
        "-2,0",
        "-2,1",
        "0,-1",
        "0,-2",
        "0,0",
        "0,1",
        "0,2",
        "1,-1",
        "1,-2",
        "1,0",
        "1,1",
        "1,2",
        "2,-1",
        "2,0",
        "2,1",
      ];
      const actual = getCircleCells(pos, d);
      expect(new Set(actual)).toEqual(new Set(expected));
    });
  });
});

describe("parseInstruction", () => {
  describe("given a valid instruction", () => {
    test("it should return the correct operation, position and diameter", () => {
      const inputs = "fg9 ls11 oe7 PLANTft9 PLANTMOWjm21".split(" ");
      const expected: [Operation, string, number][] = [
        ["mow", "6,5", 9],
        ["mow", "18,11", 11],
        ["mow", "4,14", 7],
        ["plant", "19,5", 9],
        ["plantmow", "12,9" ,21]
      ];
      inputs.forEach((input, index) => {
        const actual = parseInstruction(input);
        expect(actual[0]).toBe(expected[index][0]);
        expect(actual[1]).toBe(expected[index][1]);
        expect(actual[2]).toBe(expected[index][2]);
      });
    });
  });
});
