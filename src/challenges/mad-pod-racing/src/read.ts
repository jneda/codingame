import { Vector } from "./classes";

function readline() {
  return "";
}

export function parse(): [Vector, Vector, number, number] {
  const [podX, podY, targetX, targetY, targetDist, targetAngle] = readline()
    .split(" ")
    .map(Number);

  const [foeX, foeY] = readline().split(" ").map(Number);
  console.error(foeX, foeY);

  return [
    new Vector(podX, podY),
    new Vector(targetX, targetY),
    targetDist,
    targetAngle,
  ];
}
