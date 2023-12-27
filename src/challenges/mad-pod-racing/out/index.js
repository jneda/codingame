"use strict";
(() => {
  // src/classes/Vector.ts
  var Vector = class _Vector {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    sub(v) {
      return new _Vector(this.x - v.x, this.y - v.y);
    }
    magnitude() {
      return Math.hypot(this.x, this.y);
    }
    toString() {
      return `${this.x} ${this.y}`;
    }
  };

  // src/utils.ts
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // src/classes/Pod.ts
  var Pod = class {
    constructor(pos = new Vector(0, 0)) {
      this.pos = pos;
      this.previousPos = pos;
      this.vel = pos.sub(pos);
      this.previousVel = this.vel;
      this.target = null;
      this.thrust = 0;
    }
    update(pos, target, targetDist, targetAngle) {
      this.previousPos = this.pos;
      this.pos = pos;
      this.previousVel = this.vel;
      this.vel = this.pos.sub(this.previousPos);
      this.target = target;
      let throttle = 100;
      if (Math.abs(targetAngle) > 90) {
        const delta = Math.abs(targetAngle) - 90;
        throttle -= Math.floor(lerp(75, 100, delta * 1 / 90));
      }
      this.thrust = throttle;
      console.error({
        this: this,
        acceleration: this.vel.magnitude() - this.previousVel.magnitude(),
        speed: this.vel.magnitude(),
        targetDist,
        targetAngle
      });
      console.log(`${this.target.toString()} ${this.thrust} ${this.thrust}`);
    }
  };

  // src/read.ts
  function readline() {
    return "";
  }
  function parse() {
    const [podX, podY, targetX, targetY, targetDist, targetAngle] = readline().split(" ").map(Number);
    const [foeX, foeY] = readline().split(" ").map(Number);
    console.error(foeX, foeY);
    return [
      new Vector(podX, podY),
      new Vector(targetX, targetY),
      targetDist,
      targetAngle
    ];
  }

  // src/index.ts
  var pod = null;
  var done = false;
  while (!done) {
    const [podPos, targetPos, targetDist, targetAngle] = parse();
    if (!pod) {
      pod = new Pod(podPos);
    }
    pod.update(podPos, targetPos, targetDist, targetAngle);
  }
})();
