// https://www.codingame.com/ide/puzzle/ukuleleguitar-converter
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

    /**
     * Reads the input.
     * @returns An object containing the instrument and an array of frettings.
     */
    function readInput() {
      const instrument = readline();
      const frettingsCount = Number(readline());
      const frettings: string[] = [];
      for (let i = 0; i < frettingsCount; i++) {
        frettings.push(readline().split(" ").join("/"));
      }
      return { instrument, frettings };
    }

    /**
     * Builds a dictionary that maps the fretting positions of a ukulele or guitar to their corresponding notes.
     * @param stringsCount The number of strings on the instrument.
     * @param fretsCount The number of frets on the instrument.
     * @param openStrings An array containing the open string notes of the instrument.
     * @returns A Map object representing the dictionary, where the keys are the fretting positions in the format "string/fret" and the values are the corresponding notes.
     */
    function buildDictionary(stringsCount: number, fretsCount: number, openStrings: number[]) {
      const dict = new Map<string, string>();
      for (let string = 0; string < stringsCount; string++) {
        for (let fret = 0; fret <= fretsCount; fret++) {
          const fretting = `${string}/${fret}`;
          const note = openStrings[string] + fret;
          dict.set(fretting, note.toString());
        }
      }
      return dict;
    }

    /**
     * Builds dictionaries for guitar and ukulele.
     * 
     * The guitar dictionary represents a guitar with six strings and 21 frets with classical tuning (E2, A2, D3, G3, B3, E4).
     * The ukulele dictionary represents a ukulele with 4 strings and 15 frets with classical tuning (G4, C4, E4, A4).
     * 
     * @returns An object containing the guitar and ukulele dictionaries.
     */
    function buildDictionaries() {
      /*
       * guitar with six strings and 21 frets with classical tuning (E2, A2, D3, G3, B3, E4)
       * ukulele with 4 strings and 15 frets with classical tuning as well (G4, C4, E4, A4).
       */
      const guitar = buildDictionary(6, 21, [24, 19, 15, 10, 5, 0]);
      const ukulele = buildDictionary(4, 15, [29, 24, 20, 27]);

      return { guitar, ukulele };
    }

    const { guitar, ukulele } = buildDictionaries();
    const { instrument, frettings } = readInput();

    const [source, destination] =
      instrument === "guitar" ? [guitar, ukulele] : [ukulele, guitar];

    for (const fretting of frettings) {
      const noteQueried = source.get(fretting);
      if (noteQueried === undefined)
        throw new Error(`Invalid fretting for ${instrument}: ${fretting}.`);

      const validFrettings: string[] = [];
      destination.forEach((note, fretting) => {
        if (note === noteQueried) validFrettings.push(fretting);
      });

      console.log(validFrettings.length > 0 ? validFrettings.join(" ") : "no match");
    }
  });

  return 0;
}

main();
