import path from "path";
import fs from "fs/promises";

export async function readFile(dirname: string, filename: string) {
  const filepath = path.resolve(dirname, filename);
  try {
    const file = await fs.open(filepath);
    const lines: string[] = [];
    for await (const line of file.readLines()) lines.push(line);

    function readline() {
      const data = lines;
      const line = data.shift();
      if (!line) throw new Error("Unexpected EOF.");
      return line;
    }

    return readline;
  } catch (error) {
    console.error(error);
    throw new Error("Could not open file.");
  }
}

export async function getTestCases(
  dirname: string,
  filename: string
): Promise<[string[][], string[][]]> {
  const filepath = path.resolve(dirname, filename);
  let file: string;
  try {
    file = await fs.readFile(filepath, { encoding: "utf8" });

    const inputs: string[][] = [];
    const expected: string[][] = [];

    let state: "inputs" | "expected" = "inputs";
    let current: string[] = [];

    for (const line of file.split("\n")) {
      if (line === "") {
        switch (state) {
          case "inputs":
            inputs.push(current);
            state = "expected";
            break;
          case "expected":
            expected.push(current);
            state = "inputs";
        }
        current = [];
        continue;
      }
      current.push(line);
    }
    
    return [inputs, expected];
  } catch (error) {
    console.error(error);
    throw new Error("Could not process test cases.");
  }
}
