import { readFile } from "../lib/fs";

async function main() {
  const readline = await readFile(__dirname, "test.txt");

  const roomSize = Number.parseInt(readline());
  const lightLevel = Number.parseInt(readline());
  const map: string[] = [];
  for (let r = 0; r < roomSize; r++) {
    const line = readline().replace(/ /g, "");
    for (let c = 0; c < roomSize; c++) {
      if (line[c] === "C") {
        console.error(`Found candle at position ${c},${r}.`);
      }
    }
    map.push(line);
  }
  console.log({ lightLevel, map });

  return 0;
}

main();
