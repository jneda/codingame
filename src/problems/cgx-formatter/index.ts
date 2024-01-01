// https://www.codingame.com/training/hard/cgx-formatter

(function main() {
  const inputs = [
    // ["4", "  ", "", "  true", ""],
    // ["1", "' Content with spaces and	tabs'"],
    // ["1", "(0)"],
    // ["1", "(0;1;2)"],
    // ["1", "((true))"],
    // ["1", "()"],
    // ["1", "((true);(false);(0))"],
    ["1", "('key'='value')"],
    // ["1", "('k1'='v1';'k2'='v2';123;'k3'='v3')"],
    // [
    //   "10",
    //   "'users'=(('id'=10;",
    //   "'name'='Serge';",
    //   "'roles'=('visitor';",
    //   "'moderator'",
    //   "));",
    //   "('id'=11;",
    //   "'name'='Biales'",
    //   ");",
    //   "true",
    //   ")",
    // ],
    // [
    //   "16",
    //   "(",
    //   "'menu'=",
    //   "(",
    //   "'id'= 'file';",
    //   "'value'= 'File';",
    //   "'popup'=",
    //   "(",
    //   "'menuitem'=",
    //   "(",
    //   "( 'value'= 'New'; 'onclick'= 'CreateNewDoc()' );",
    //   "( 'value'= 'Open'; 'onclick'= 'OpenDoc()' );",
    //   "( 'value'= 'Close'; 'onclick'= 'CloseDoc()' )",
    //   ")",
    //   "); ()",
    //   ")",
    //   ")",
    // ],
    // [
    //   "3",
    //   "((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((((",
    //   "0",
    //   "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))",
    // ],
  ];

  inputs.forEach((input, index) => {
    function readline() {
      const line = input.shift();
      return line;
    }

    /**
     * Parses the input and returns the concatenated string.
     *
     * @returns The concatenated string.
     */
    function parseInput() {
      let cgx = "";

      const n = Number(readline());
      for (let i = 0; i < n; i++) {
        cgx += readline();
      }

      return cgx;
    }

    /**
     * Lexically analyzes a string and returns an array of tokens.
     * @param string The string to be analyzed.
     * @returns An array of tokens.
     */
    function lex(string: string) {
      const CGX_WHITESPACE: string[] = [" ", "\t", "\r", "\n"];
      const CGX_SYNTAX: string[] = ["(", ")", ":", ";", "="];
      const CGX_QUOTE = "'";

      function lexString(string: string): [string | null, string] {
        let cgxString = "'";

        if (string[0] === CGX_QUOTE) {
          string = string.slice(1);
        } else {
          return [null, string];
        }

        for (const c of string) {
          if (c === CGX_QUOTE) {
            return [cgxString + "'", string.slice(cgxString.length)];
          } else {
            cgxString += c;
          }
        }

        throw new Error("Expected end of string quote.");
      }

      function lexNumber(string: string): [string | null, string] {
        let cgxNumber = "";

        const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

        for (const c of string) {
          if (!digits.includes(c)) {
            break;
          }
          cgxNumber += c;
        }

        const rest = string.slice(cgxNumber.length);

        if (cgxNumber.length === 0) {
          return [null, rest];
        }

        return [cgxNumber, rest];
      }

      function lexBoolean(string: string): [string | null, string] {
        let cgxBoolean = "";

        const trueChars = "true";
        const falseChars = "false";

        let i = 0;

        while (CGX_WHITESPACE.includes(string[i])) {
          i++;
        }

        if (string[i] !== "t" && string[i] !== "f") {
          return [null, string];
        }

        cgxBoolean = string[i];
        let matchedChars = "";

        switch (cgxBoolean) {
          case "t": {
            matchedChars = trueChars;
            break;
          }
          case "f": {
            matchedChars = falseChars;
            break;
          }
          default: {
            throw new Error(`Expected "t" or "f", got "${string[i]}".`);
          }
        }

        i++;
        while (cgxBoolean.length < matchedChars.length) {
          if (CGX_WHITESPACE.includes(string[i])) {
            i++;
            continue;
          }
          if (string[i] !== matchedChars[cgxBoolean.length]) {
            return [null, string];
          }
          cgxBoolean += string[i];
          i++;
        }

        return [cgxBoolean, string.slice(i)];
      }

      function lexNull(string: string): [string | null, string] {
        let cgxNull = "";

        const nullChars = "null";

        let i = 0;

        while (CGX_WHITESPACE.includes(string[i])) {
          i++;
        }

        if (string[i] !== "n") {
          return [null, string];
        }

        cgxNull = string[i];

        i++;
        while (cgxNull.length < nullChars.length) {
          if (CGX_WHITESPACE.includes(string[i])) {
            i++;
            continue;
          }
          if (string[i] !== nullChars[cgxNull.length]) {
            return [null, string];
          }
          cgxNull += string[i];
          i++;
        }

        return [cgxNull, string.slice(i)];
      }

      const tokens: string[] = [];

      while (string.length > 0) {
        let cgxString: string | null = null;
        [cgxString, string] = lexString(string);
        if (cgxString !== null) {
          tokens.push(cgxString);
          continue;
        }

        let cgxNumber: string | null = null;
        [cgxNumber, string] = lexNumber(string);
        if (cgxNumber !== null) {
          tokens.push(cgxNumber);
          continue;
        }

        let cgxBoolean: string | null = null;
        [cgxBoolean, string] = lexBoolean(string);
        if (cgxBoolean !== null) {
          tokens.push(cgxBoolean);
          continue;
        }

        let cgxNull: string | null = null;
        [cgxNull, string] = lexNull(string);
        if (cgxNull !== null) {
          tokens.push(cgxNull);
        }

        if (CGX_WHITESPACE.includes(string[0])) {
          string = string.slice(1);
        } else if (CGX_SYNTAX.includes(string[0])) {
          tokens.push(string[0]);
          string = string.slice(1);
        } else {
          throw new Error(`Unexpected character: ${string[0]}.`);
        }
      }

      return tokens;
    }

    /**
     * Parses an array of tokens and formats them according to specific rules.
     *
     * @param tokens - The array of tokens to be parsed.
     * @returns The formatted output string.
     */
    function parse(tokens: string[]) {
      let indentLevel = 0;
      const indentation = () => " ".repeat(4 * indentLevel);

      let output = "";

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        switch (token) {
          case ";": {
            output += token + "\n";
            break;
          }
          case "(": {
            if (
              output[output.length - 1] === ":" ||
              output[output.length - 1] === "="
            ) {
              output += "\n";
            }
            output += indentation() + token + "\n";
            indentLevel++;
            break;
          }
          case ")": {
            if (output[output.length - 1] !== "\n") {
              output += "\n";
            }
            indentLevel--;
            output += indentation() + token;
            break;
          }
          default: {
            if (token !== "=" && output[output.length - 1] !== "=") {
              output += indentation();
            }
            output += token;
          }
        }
      }

      return output;
    }

    const cgx = parseInput();
    const tokens = lex(cgx);
    const output = parse(tokens);
    console.log(output);
  });

  return 0;
})();
