// https://www.codingame.com/training/medium/telephone-numbers
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
     * Parses the input by reading a number from the input and then reading that many lines.
     * @returns An array of strings representing the parsed input.
     */
    function parse() {
      return Array.from({ length: Number(readline()) }, () => readline());
    }

    /**
     * Represents a node in a telephone number trie.
     */
    class Node {
      children: Record<string, Node> = {};
      isTerminal = false;
      value: string | null;

      /**
       * Creates a new instance of the Node class.
       * @param value The value associated with the node.
       */
      constructor(value: string | null = null) {
        this.value = value;
      }
    }

    /**
     * Represents a Trie data structure.
     */
    class Trie {
      root = new Node();

      /**
       * Inserts a new key into the trie.
       * 
       * @param key - The key to be inserted.
       */
      insert(key: string) {
        let current = this.root;
        for (const char of key) {
          if (current.children[char] === undefined) {
            current.children[char] = new Node(char);
          }
          current = current.children[char];
        }
        current.isTerminal = true;
      }

      /**
       * Explores the trie data structure starting from the root node.
       * Returns the count of nodes visited during the exploration.
       */
      explore() {
        let key = "";
        const stack: [Node, string][] = [[this.root, key]];
        let count = 0;

        while (stack.length > 0) {
          const current = stack.pop();
          if (current === undefined)
            throw new Error("Unexpected end of stack.");

          let [currentNode, key] = current;
          if (currentNode.value) {
            count++;
            key += currentNode.value;
          }

          // if (currentNode.isTerminal) console.log(key);

          for (const node of Object.values(currentNode.children)) {
            stack.push([node, key]);
          }
        }

        return count;
      }
    }

    const phoneNumbers = parse();

    const trie = new Trie();
    for (const phoneNumber of phoneNumbers) {
      trie.insert(phoneNumber);
    }

    const count = trie.explore();
    console.log(count);

    const expectedCount = Number(expected[index][0]);
    console.assert(count === expectedCount);
    console.log();
  });

  return 0;
}

main();
