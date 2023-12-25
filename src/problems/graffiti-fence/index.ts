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

    class Segment {
      start: number;
      end: number;

      constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
      }

      includes(other: Segment) {
        return this.start <= other.start && this.end >= other.end;
      }

      overlaps(other: Segment) {
        return (
          (this.start <= other.start &&
            other.start <= this.end &&
            this.end <= other.end) ||
          (this.end >= other.end &&
            other.start <= this.start &&
            this.start <= other.end)
        );
      }

      mergeWith(other: Segment) {
        if (
          !this.overlaps(other) &&
          !this.includes(other) &&
          !other.includes(this)
        )
          throw new Error(
            `Cannot merge Segment [${this.start}, ${this.end}] with Segment [${other.start}, ${other.end}].`
          );

        const start = Math.min(this.start, other.start);
        const end = Math.max(this.end, other.end);

        return new Segment(start, end);
      }

      toString() {
        return `${this.start} ${this.end}`;
      }
    }

    function consolidateReports(reports: Segment[]) {
      let consolidatedReports: Segment[] = [];

      for (let report of reports) {
        for (let i = consolidatedReports.length - 1; i >= 0; i--) {
          const current = consolidatedReports[i];

          if (
            report.overlaps(current) ||
            report.includes(current) ||
            current.includes(report)
          ) {
            report = report.mergeWith(current);
            consolidatedReports = consolidatedReports.filter(
              (segment) => segment.toString() !== current.toString()
            );
          }
        }

        consolidatedReports.push(report);
      }

      return consolidatedReports;
    }

    function sortSegments(a: Segment, b: Segment) {
      return a.start - b.start;
    }

    function getUnpaintedSegments(length: number, painted: Segment[]) {
      const unpainted: Segment[] = [];

      let lastIndex = 0;
      for (const segment of painted) {
        console.error(segment);
        if (segment.start > lastIndex) {
          unpainted.push(new Segment(lastIndex, segment.start));
        }
        lastIndex = segment.end;
      }

      const lastSegmentIndex = painted[painted.length - 1].end;
      if (lastSegmentIndex < length) {
        unpainted.push(new Segment(lastSegmentIndex, length));
      }

      return unpainted;
    }

    function parse() {
      const length = Number(readline());

      const reports: Segment[] = [];

      const n = Number(readline());
      for (let i = 0; i < n; i++) {
        const [start, end] = readline().split(" ").map(Number);
        reports.push(new Segment(start, end));
      }

      return { length, reports };
    }

    const { length, reports } = parse();

    const consolidatedReports = consolidateReports(reports);

    const unpainted = getUnpaintedSegments(
      length,
      consolidatedReports.sort(sortSegments)
    );

    console.log(
      unpainted.length > 0
        ? unpainted.map((segment) => segment.toString()).join("\n")
        : "All painted"
    );
    console.error("");
  });

  return 0;
}

main();
