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
