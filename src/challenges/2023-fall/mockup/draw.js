function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawBiomeUpperLimits();
  if (target) {
    drawPoint(target);
  }
  agents.forEach((agent) => agent.draw());
}

function toCanvas(p) {
  return {
    x: p.x * TILE_SIZE + POINT_OFFSET.x,
    y: p.y * TILE_SIZE + POINT_OFFSET.y,
  };
}

function drawPoint(p, color = "white") {
  const { x, y } = toCanvas(p);
  ctx.beginPath();
  ctx.arc(x, y, TILE_SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSegment(start, end, color = "white") {
  const { x: startX, y: startY } = toCanvas(start);
  const { x: endX, y: endY } = toCanvas(end);

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawArc(p, radius, color = "white") {
  const { x, y } = toCanvas(p);
  ctx.beginPath();
  ctx.arc(x, y, radius * TILE_SIZE + TILE_SIZE / 2, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawLightRadius(e) {
  const { clientX, clientY } = e;
  const gridX = Math.floor(clientX / TILE_SIZE);
  const gridY = Math.floor(clientY / TILE_SIZE);

  if (0 > gridX || gridX > WIDTH - 1 || 0 > gridY || gridY > HEIGHT - 1) return;

  const { top, left, bottom, right } = getRectBounds(gridX, gridY);

  draw();

  // draw mouse position
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, bottom);
  ctx.lineTo(left, bottom);
  ctx.closePath();
  ctx.fill();

  // draw light radius
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(
    left + TILE_SIZE / 2,
    top + TILE_SIZE / 2,
    20 * TILE_SIZE,
    0,
    Math.PI * 2
  );
  ctx.stroke();
}

function drawGrid() {
  for (let r = 0; r < HEIGHT; r++) {
    for (let c = 0; c < WIDTH; c++) {
      const { top, left, bottom, right } = getRectBounds(c, r);
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "#999";
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.stroke();
    }
  }

  for (let c = 0; c < WIDTH; c += 8) {
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "orange";
    ctx.beginPath();
    const x = c * TILE_SIZE;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT * TILE_SIZE);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo((WIDTH / 2) * TILE_SIZE, 0);
  ctx.lineTo((WIDTH / 2) * TILE_SIZE, HEIGHT * TILE_SIZE);
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "#999";
  ctx.stroke();
}

function drawBiomeUpperLimits() {
  const UPPER_LIMITS = [25, 50, 75];
  for (upper of UPPER_LIMITS) {
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = "#99e";
    ctx.beginPath();
    ctx.moveTo(0, upper * TILE_SIZE);
    ctx.lineTo(WIDTH * TILE_SIZE, upper * TILE_SIZE);
    ctx.closePath();
    ctx.stroke();
  }
}

function getRectBounds(x, y) {
  const top = y * TILE_SIZE;
  const bottom = top + TILE_SIZE;
  const left = x * TILE_SIZE;
  const right = left + TILE_SIZE;
  return { top, left, bottom, right };
}
