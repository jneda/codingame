// https://www.codingame.com/training/easy/hidden-messages-in-images
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

    function toBin(dec: number) {
      return dec.toString(2);
    }

    function toDec(bin: string) {
      return parseInt(bin, 2);
    }

    function parse() {
      const [_w, h] = readline().split(" ").map(Number);

      const bytes: string[] = [];
      let byte = "";

      for (let i = 0; i < h; i++) {
        const numbers = readline().split(" ").map(Number);

        for (const n of numbers) {
          const bin = toBin(n);
          byte += bin[bin.length - 1];
          
          if (byte.length === 8) {
            bytes.push(byte);
            byte = "";
          }
        }
      }

      return bytes;
    }

    function decode(byte: string) {
      const dec = toDec(byte);
      return String.fromCharCode(dec);
    }

    const bytes = parse();
    const message = bytes.map(byte => decode(byte)).join("");
    console.log(message);
  });

  return 0;
}

main();
