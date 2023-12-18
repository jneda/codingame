import { stringify } from "querystring";
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

    function parseInput() {
      const codes: Record<string, string> = {};
      const trie = new Trie();

      const n = parseInt(readline());
      for (let i = 0; i < n; i++) {
        const [code, charCode] = readline().split(" ");
        trie.insert(code);
        codes[code] = String.fromCharCode(parseInt(charCode));
      }
      const encoded = readline();

      return { codes, trie, encoded };
    }

    class TrieNode {
      children: Record<string, TrieNode> = {};
      end: boolean = false;
    }

    class Trie {
      root: TrieNode = new TrieNode();

      insert(code: string) {
        let current = this.root;

        for (let i = 0; i < code.length; i++) {
          const char = code[i];
          let node = current.children[char];

          if (node === undefined) {
            node = new TrieNode();
            current.children[char] = node;
          }

          current = node;
        }
        current.end = true;
      }

      search(code: string) {
        let current = this.root;

        for (let i = 0; i < code.length; i++) {
          const char = code[i];
          let node = current.children[char];

          if (node === undefined) return false;

          current = node;
        }

        return current.end;
      }

      print() {
        console.log(JSON.stringify(this, null, 1));
      }
    }

    function decode() {
      let decoded = "";
      let substring = "";

      for (let i = 0; i < encoded.length; i++) {
        substring += encoded[i];

        if (trie.search(substring)) {
          decoded += codes[substring];
          substring = "";
        }
      }

      if (substring.length > 0) {
        const substringStartIndex = encoded.length - substring.length;
        return `DECODE FAIL AT INDEX ${substringStartIndex}`;
      }

      return decoded;
    }

    const { codes, trie, encoded } = parseInput();

    const decoded = decode();

    const expectedDecoded = expected[index].join("\n");
    console.assert(
      decoded === expectedDecoded,
      `expected "${expectedDecoded}", got "${decoded}".`
    );
  });

  return 0;
}

main();
