class Agent {
  constructor(pos, ctx) {
    this.pos = pos;
    this.ctx = ctx;
    this.color = "darkcyan";
    this.speed = 0;
    this.direction = 0;
    this.destination = this.pos;
    this.target = null;
  }

  draw() {
    drawPoint(this.pos, this.color);
  }

  update() {}
}

class Drone extends Agent {
  static SIGHT_RADIUS = 8;
  static MAX_SPEED = 6;
  static UGLY_DETECTION_RANGE = Drone.SIGHT_RADIUS + 3;

  constructor(pos, ctx) {
    super(pos, ctx);
    this.color = "cyan";
  }

  draw() {
    if (this.target) {
      drawSegment(this.pos, this.target);
      drawSegment(this.pos, this.destination, "cyan");
    }

    super.draw();

    drawArc(this.pos, Drone.MAX_SPEED, "darkcyan");
    drawArc(this.pos, Drone.SIGHT_RADIUS, "cyan");
    drawArc(this.pos, Drone.UGLY_DETECTION_RANGE, "darkcyan");
  }

  findTarget() {
    if (!this.target) return;

    const targetDirection = direction(this.pos, this.target);
    const targetDistance = magnitude(subtractV(this.pos, this.target));

    const velocity = toXY({
      mag: Math.min(this.speed, targetDistance),
      dir: targetDirection,
    });

    this.destination = addV(this.pos, velocity);

    console.table({
      pos: this.pos,
      target: this.target,
      destination: {
        x: Math.floor(this.destination.x),
        y: Math.floor(this.destination.y),
      },
    });
  }

  update() {
    this.pos = {
      x: Math.floor(this.destination.x),
      y: Math.floor(this.destination.y),
    };
  }
}
