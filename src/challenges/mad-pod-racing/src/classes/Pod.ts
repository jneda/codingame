import { Vector } from "./Vector";
import { lerp } from "../utils";

export class Pod {
  pos: Vector;
  previousPos: Vector;
  vel: Vector;
  previousVel: Vector;
  target: Vector | null;
  thrust: number;

  constructor(pos = new Vector(0, 0)) {
    this.pos = pos;
    this.previousPos = pos;
    this.vel = pos.sub(pos);
    this.previousVel = this.vel;
    this.target = null;
    this.thrust = 0;
  }

  update(pos: Vector, target: Vector, targetDist: number, targetAngle: number) {
    this.previousPos = this.pos;
    this.pos = pos;
    this.previousVel = this.vel;
    this.vel = this.pos.sub(this.previousPos);
    this.target = target;

    let throttle = 100;
    if (Math.abs(targetAngle) > 90) {
      const delta = Math.abs(targetAngle) - 90;
      throttle -= Math.floor(lerp(75, 100, (delta * 1) / 90));
    }
    this.thrust = throttle;

    console.error({
      this: this,
      acceleration: this.vel.magnitude() - this.previousVel.magnitude(),
      speed: this.vel.magnitude(),
      targetDist,
      targetAngle,
    });

    console.log(`${this.target.toString()} ${this.thrust} ${this.thrust}`);
  }
}
