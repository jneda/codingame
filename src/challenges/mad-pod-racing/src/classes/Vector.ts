export class Vector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  sub(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  toString() {
    return `${this.x} ${this.y}`;
  }
}
