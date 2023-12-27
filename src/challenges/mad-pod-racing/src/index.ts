import { parse } from "./read";
import { Pod } from "./classes";

let pod: Pod | null = null;

let done = false;
while (!done) {
  const [podPos, targetPos, targetDist, targetAngle] = parse();
  if (!pod) {
    pod = new Pod(podPos);
  }

  pod.update(podPos, targetPos, targetDist, targetAngle);
}
