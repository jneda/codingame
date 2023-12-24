// https://www.codingame.com/ide/puzzle/interstellar
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
     * Parses a string representation of a vector and returns a Vector object.
     * The string should be in the format of "a1i + b2j - c3k", where a1, b2, and c3 are numeric coefficients.
     * The function extracts the coefficients for the i, j, and k components of the vector and constructs a Vector object.
     * @param s The string representation of the vector.
     * @returns A Vector object representing the parsed vector.
     * @throws Error if the string cannot be parsed.
     */
    function parseVectorString(s: string) {
      let i = 0;
      let j = 0;
      let k = 0;

      const vectorRegex = /[-+]? *\d* *[ijk]/g;
      const matches = s.match(vectorRegex);
      if (!matches) throw new Error(`Unable to parse string: "${s}".`);

      for (const match of matches) {
        const numericPart = match.match(/\d+/);
        const factor = numericPart ? Number(numericPart) : 1;
        const sign = match.includes("-") ? -1 : 1;
        const result = sign * factor;

        if (match.includes("i")) i = result;
        else if (match.includes("j")) j = result;
        else if (match.includes("k")) k = result;
      }

      return new Vector(i, j, k);
    }

    /**
     * Calculates the greatest common divisor (GCD) of two numbers.
     *
     * @param a - The first number.
     * @param b - The second number.
     * @returns The greatest common divisor of `a` and `b`.
     */
    function gcd(a: number, b: number) {
      a = Math.abs(a);
      b = Math.abs(b);

      const max = Math.max(a, b);
      const min = Math.min(a, b);
      a = max;
      b = min;

      while (b > 0) {
        let temp = b;
        b = a % b;
        a = temp;
      }

      return a;
    }

    /**
     * Represents a vector in three-dimensional space.
     */
    class Vector {
      i: number;
      j: number;
      k: number;

      /**
       * Creates a new instance of the Vector class.
       * @param i - The value for the 'i' property.
       * @param j - The value for the 'j' property.
       * @param k - The value for the 'k' property.
       */
      constructor(i: number, j: number, k: number) {
        this.i = i;
        this.j = j;
        this.k = k;
      }

      /**
       * Subtracts the components of another vector from this vector.
       *
       * @param other - The vector to subtract.
       * @returns A new vector representing the result of the subtraction.
       */
      subtract(other: Vector) {
        const i = this.i - other.i;
        const j = this.j - other.j;
        const k = this.k - other.k;

        return new Vector(i, j, k);
      }

      /**
       * Calculates the magnitude of the vector.
       *
       * @returns The magnitude of the vector.
       */
      magnitude() {
        const result = Math.sqrt(this.i ** 2 + this.j ** 2 + this.k ** 2);
        return Math.round((result + Number.EPSILON) * 100) / 100;
      }

      /**
       * Simplifies the vector by dividing each component by the greatest common divisor (GCD) of the vector's components.
       * @returns A new Vector object representing the simplified vector.
       */
      simplify() {
        const thisGcd = gcd(gcd(this.i, this.j), this.k);
        return new Vector(this.i / thisGcd, this.j / thisGcd, this.k / thisGcd);
      }

      /**
       * Returns a string representation of the vector.
       * The vector is formatted as a combination of its components i, j, and k.
       * Positive components are prefixed with a "+" sign, while negative components are prefixed with a "-" sign.
       * If a component has a value of 1, the value is omitted.
       * 
       * @returns The string representation of the vector.
       */
      toString() {
        const formatComponent = (value: number, label: string) => {
          if (value > 0) {
            return "+" + (value === 1 ? "" : value.toString()) + label;
          }
          if (value < 0) {
            return (value === -1 ? "-" : value.toString()) + label;
          }
          return "";
        };

        const simplified = this.simplify();
        let formattedVector =
          formatComponent(simplified.i, "i") +
          formatComponent(simplified.j, "j") +
          formatComponent(simplified.k, "k");

        if (formattedVector.startsWith("+")) {
          formattedVector = formattedVector.slice(1);
        }

        return formattedVector;
      }
    }

    const pos = parseVectorString(readline());
    const dest = parseVectorString(readline());

    const dir = dest.subtract(pos);
    const dist = dir.magnitude();

    console.log(`Direction: ${dir}`);
    console.log(`Distance: ${dist}`);
  });

  return 0;
}

main();
