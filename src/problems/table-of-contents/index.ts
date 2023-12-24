// https://www.codingame.com/training/easy/table-of-contents
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
     * Represents an entry in the table of contents.
     */
    type Entry = {
      indentLevel: number;
      title: string;
      page: string;
    };

    /**
     * Parses an entry from the table of contents.
     * 
     * @param entry - The entry string to parse.
     * @returns An object containing the indent level, title, and page of the entry.
     * @throws Error if the entry cannot be parsed.
     */
    function parseEntry(entry: string) {
      const [rest, page] = entry.split(" ");

      const indentRegex = />*/;
      const indentMatch = rest.match(indentRegex);
      if (indentMatch === null) throw new Error(`Could not parse "${rest}".`);

      const indentLevel = indentMatch[0].length;
      const title = rest.slice(indentLevel);

      return { indentLevel, title, page };
    }

    /**
     * Parses the input to extract the line length and entries.
     * @returns An object containing the line length and an array of entries.
     */
    function parse() {
      const lineLength = Number(readline());
      const n = Number(readline());
      const entries: Entry[] = [];
      for (let i = 0; i < n; i++) {
        entries.push(parseEntry(readline()));
      }

      return { lineLength, entries };
    }

    /**
     * Prints an entry in the table of contents.
     * 
     * @param entry - The entry to be printed.
     * @param sectionNumber - The section number of the entry.
     */
    function printEntry(entry: Entry, sectionNumber: number) {
      const leftPadding = " ".repeat(entry.indentLevel * 4);
      const numberedTitle = `${sectionNumber} ${entry.title}`;
      const centerPadding = ".".repeat(
        lineLength -
          leftPadding.length -
          numberedTitle.length -
          entry.page.length
      );
      console.log(leftPadding + numberedTitle + centerPadding + entry.page);
    }

    /**
     * Prints the entries of the table of contents.
     */
    function printEntries() {
      let sectionCounts: number[] = [];
      for (const entry of entries) {
        const indentLevel = entry.indentLevel;
        // reset section counts for lower levels when we go up levels
        if (sectionCounts[indentLevel] < sectionCounts.length) {
          sectionCounts = sectionCounts.slice(0, indentLevel + 1);
        }
        // otherwise, increment section count
        if (sectionCounts[indentLevel] === undefined) {
          sectionCounts[indentLevel] = 0;
        }
        sectionCounts[indentLevel]++;
        printEntry(entry, sectionCounts[indentLevel]);
      }
    }

    const { lineLength, entries } = parse();
    printEntries();
  });

  return 0;
}

main();
