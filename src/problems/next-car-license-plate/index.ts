// https://www.codingame.com/training/easy/next-car-license-plate
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

    class LicensePlate {
      prefix: string;
      number: string;
      postfix: string;

      constructor(plateString: string) {
        const elts = plateString.split("-");
        this.prefix = elts[0];
        this.number = elts[1];
        this.postfix = elts[2];
      }

      toString() {
        return `${this.prefix}-${this.number}-${this.postfix}`;
      }

      increment(inc: number) {
        const codeZ = "Z".charCodeAt(0);
        
        const incrementChar = (c: string, inc: number): [string, number] => {
          let overflow = 0;
          while (c.charCodeAt(0) + inc > codeZ) {
            inc -= 26;
            overflow++;
          }
          let newCharCode = c.charCodeAt(0) + inc;
          return [String.fromCharCode(newCharCode), overflow];
        };

        const incrementString = (s: string, inc: number): [string, number] => {
          const [firstChar, lastChar] = s.split("");
          const [newLastChar, lastCharOverflow] = incrementChar(lastChar, inc);
          const [newFirstChar, overflow] = incrementChar(
            firstChar,
            lastCharOverflow
          );
          return [newFirstChar + newLastChar, overflow];
        };

        const incrementNumber = (
          nString: string,
          inc: number
        ): [string, number] => {
          let newN = Number(nString) + inc;
          let overflow = 0;
          while (newN > 999) {
            overflow += 1;
            newN -= 999;
          }
          return [newN.toString().padStart(3, "0"), overflow];
        };

        const [newNumber, numberOverflow] = incrementNumber(this.number, inc);

        const [newPostFix, postfixOverflow] = incrementString(
          this.postfix,
          numberOverflow
        );

        const [newPrefix, prefixOverflow] = incrementString(
          this.prefix,
          postfixOverflow
        );

        if (prefixOverflow)
          throw new Error(`Last possible license plate overflow.`);

        return new LicensePlate(`${newPrefix}-${newNumber}-${newPostFix}`);
      }
    }

    function parse() {
      const plateString = readline();
      const plate = new LicensePlate(plateString);

      const increment = Number(readline());

      return { plate, increment };
    }

    const { plate, increment } = parse();
    const newPlate = plate.increment(increment);
    console.log(newPlate.toString());
  });

  return 0;
}

main();
