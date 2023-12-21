function addV(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

function subtractV(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
  };
}

function distance(v1, v2) {
  const dX = v1.x - v2.x;
  const dY = v1.y - v2.y;
  return Math.hypot(dX, dY);
}

function direction(v1, v2) {
  const dX = v2.x - v1.x;
  const dY = v2.y - v1.y;
  return Math.atan2(dY, dX);
}

function magnitude({ x, y }) {
  return Math.hypot(x, y);
}

function scale({ x, y }, scalar) {
  return { x: x * scalar, y: y * scalar };
}

function normalize(v) {
  return scale(v, 1 / magnitude(v));
}

function toPolar({ x, y }) {
  return {
    mag: magnitude({ x, y }),
    dir: direction({ x, y }),
  };
}

function toXY({ mag, dir }) {
  return {
    x: Math.cos(dir) * mag,
    y: Math.sin(dir) * mag,
  };
}
