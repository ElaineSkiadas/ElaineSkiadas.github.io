// PROMPT: Generate a p5js sketch of a Kandinsky inspired painting, include some animated elements. Javascript only

//Kandinsky-inspired p5.js sketch (JavaScript only)
// Drop this into the p5.js editor. Uses animated rotation, drift, and pulse.
// Made to feel like layered paper, bold primaries, crisp geometry + playful motion.

let palette = [
  "#0a0a0a", // near-black
  "#f2e9e4", // off-white / paper
  "#e63946", // red
  "#1d3557", // deep blue
  "#457b9d", // sky blue
  "#f4a261", // orange
  "#e9c46a", // yellow
  "#2a9d8f"  // teal
];

let seed = 20250811;
let rings = [];
let swivels = [];
let slides = [];
let confetti = [];
let grainG;

function setup() {
  randomSeed(seed);
  noiseSeed(seed);
  createCanvas(windowWidth/2, windowHeight/2);
  angleMode(DEGREES);
  noStroke();

  // Subtle paper texture
  grainG = createGraphics(width, height);
  grainG.noStroke();
  for (let i = 0; i < width * height * 0.015; i++) {
    const x = random(width);
    const y = random(height);
    const a = random(8, 22);
    grainG.fill(0, 0, 0, a);
    grainG.rect(x, y, 1, 1);
  }

  // Layout guides (golden-ish grid)
  const cols = 6;
  const rows = 4;
  const gx = Array.from({ length: cols + 1 }, (_, i) => map(i, 0, cols, width * 0.08, width * 0.92));
  const gy = Array.from({ length: rows + 1 }, (_, i) => map(i, 0, rows, height * 0.12, height * 0.88));

  // Big colored fields (static “paper” blocks)
  push();
  blendMode(MULTIPLY);
  drawField(gx[0], gy[0], gx[2] - gx[0], gy[2] - gy[0], color("#f2e9e4"));
  drawField(gx[2], gy[0], gx[4] - gx[2], gy[1] - gy[0], color("#e9c46a"));
  drawField(gx[1], gy[2], gx[3] - gx[1], gy[4] - gy[2], color("#f4a261"));
  drawField(gx[4], gy[1], gx[6] - gx[4], gy[4] - gy[1], color("#457b9d"));
  pop();

  // Constellations of rings (animated orbit/pulse)
  for (let i = 0; i < 5; i++) {
    rings.push(new Ring(
      createVector(random(width * 0.2, width * 0.8), random(height * 0.25, height * 0.75)),
      random(50, min(width, height) * 0.15),
      random(0.4, 0.9),
      random(palette.slice(2)), // bolds
      random([true, false])
    ));
  }

  // Rotating “bars” (swiveling rect groups)
  for (let i = 0; i < 6; i++) {
    swivels.push(new Swivel(
      createVector(random(width * 0.15, width * 0.85), random(height * 0.2, height * 0.85)),
      random(60, 160),
      random(8, 22),
      random(palette.slice(2)),
      random([-1, 1]) * random(0.2, 0.8)
    ));
  }

  // Sliding lines (animated across canvas)
  for (let i = 0; i < 5; i++) {
    slides.push(new Slide(
      random([0, 1]) < 0.5 ? "horizontal" : "vertical",
      random(palette),
      random(2, 6),
      random(0.4, 1.2)
    ));
  }

  // Confetti circles (slow drift + flicker)
  for (let i = 0; i < 90; i++) {
    confetti.push({
      x: random(width),
      y: random(height),
      r: random(3, 10),
      c: color(random(palette)),
      n: random(1000)
    });
  }
}

function draw() {
  background("#f2e9e4");

  // Layered diagonals / arcs for Kandinsky flavor
  drawDiagonalStripes();
  drawBigArc();

  // Slides beneath shapes
  push();
  blendMode(MULTIPLY);
  slides.forEach(s => s.updateAndDraw());
  pop();

  // Core shapes
  rings.forEach(r => r.updateAndDraw());
  swivels.forEach(s => s.updateAndDraw());

  // Dot constellations on top
  drawConfetti();

  // Fine linework overlay
  drawWire();

  // Paper grain
  push();
  blendMode(MULTIPLY);
  image(grainG, 0, 0);
  pop();
}

// ---------- Shapes & Systems ----------

function drawField(x, y, w, h, c) {
  push();
  fill(c);
  rect(x, y, w, h, 4);
  pop();
}

function drawDiagonalStripes() {
  push();
  noFill();
  stroke("#0a0a0a");
  strokeWeight(2);
  const gap = 38;
  const a = 8; // alpha for subtlety handled via blend
  blendMode(MULTIPLY);
  for (let i = -height; i < width + height; i += gap) {
    const y1 = 0;
    const x1 = i;
    const y2 = height;
    const x2 = i - height;
    stroke(10, 10, 10, a);
    line(x1, y1, x2, y2);
  }
  pop();
}

function drawBigArc() {
  push();
  noFill();
  stroke("#1d3557");
  strokeWeight(16);
  strokeCap(SQUARE);
  const r = min(width, height) * 0.7;
  const cx = width * 0.72;
  const cy = height * 0.2;
  arc(cx, cy, r, r, 200, 330);
  pop();
}

function drawWire() {
  push();
  stroke("#0a0a0a");
  strokeWeight(3);
  const t = frameCount;
  // Wavy wire
  beginShape();
  for (let x = 0; x <= width; x += 20) {
    const y = height * 0.85 + sin(x * 0.8 + t * 2) * 10;
    vertex(x, y);
  }
  endShape();
  // Crosshair
  strokeWeight(2);
  line(width * 0.12, height * 0.18, width * 0.18, height * 0.12);
  line(width * 0.12, height * 0.12, width * 0.18, height * 0.18);
  pop();
}

class Ring {
  constructor(center, baseR, density, col, clockwise = true) {
    this.center = center;
    this.baseR = baseR;
    this.density = density;
    this.col = color(col);
    this.dir = clockwise ? 1 : -1;
    this.spin = random(360);
    this.pulseSpeed = random(0.3, 0.8);
    this.satellites = floor(random(3, 7));
  }
  updateAndDraw() {
    const t = frameCount;
    const pulse = sin(t * this.pulseSpeed) * 6;
    const R = this.baseR + pulse;

    push();
    translate(this.center.x, this.center.y);
    rotate(this.spin + t * 0.4 * this.dir);

    // Filled ring segments
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), 180);
    circle(0, 0, R * 2);

    fill("#f2e9e4");
    circle(0, 0, R * (1 - this.density) * 2);

    // Orbiting dots
    for (let i = 0; i < this.satellites; i++) {
      const a = (360 / this.satellites) * i + t * 1.2 * this.dir;
      const rr = R * 0.68;
      const x = cos(a) * rr;
      const y = sin(a) * rr;
      fill(random(palette));
      circle(x, y, 10 + 4 * sin(t * 2 + i * 60));
    }
    pop();

    // Radial ticks
    push();
    translate(this.center.x, this.center.y);
    stroke("#0a0a0a");
    strokeWeight(2);
    for (let k = 0; k < 5; k++) {
      const a = this.spin + k * 36 + t * 0.6 * this.dir;
      const r1 = R * 0.2;
      const r2 = R * 0.5;
      line(cos(a) * r1, sin(a) * r1, cos(a) * r2, sin(a) * r2);
    }
    pop();
  }
}

class Swivel {
  constructor(center, len, thick, col, speed) {
    this.center = center;
    this.len = len;
    this.thick = thick;
    this.col = color(col);
    this.speed = speed;
    this.phase = random(360);
  }
  updateAndDraw() {
    const t = frameCount;
    const ang = this.phase + t * this.speed;
    push();
    translate(this.center.x, this.center.y);
    rotate(ang);

    // Bar
    noStroke();
    fill(this.col);
    rectMode(CENTER);
    rect(0, 0, this.len, this.thick, 999);

    // Accent circle
    fill("#e63946");
    circle(this.len * 0.28, 0, this.thick * 1.2);

    // Tiny notch
    fill("#0a0a0a");
    rect(-this.len * 0.3, 0, 6, this.thick * 0.9);

    pop();
  }
}

class Slide {
  constructor(orientation, col, w, speed) {
    this.orientation = orientation;
    this.col = color(col);
    this.w = w;
    this.speed = speed;
    this.offset = random(1000);
  }
  updateAndDraw() {
    const t = frameCount * this.speed;
    push();
    stroke(this.col);
    strokeWeight(this.w);
    if (this.orientation === "horizontal") {
      const y = (noise(this.offset + t * 0.002) * 1.2 - 0.1) * height;
      line(0, y, width, y);
    } else {
      const x = (noise(this.offset + t * 0.002) * 1.2 - 0.1) * width;
      line(x, 0, x, height);
    }
    pop();
  }
}

function drawConfetti() {
  push();
  for (let p of confetti) {
    const t = frameCount;
    const dx = (noise(p.n + t * 0.003) - 0.5) * 0.8;
    const dy = (noise(p.n + 500 + t * 0.003) - 0.5) * 0.8;
    p.x += dx;
    p.y += dy;
    const a = 180 + 60 * sin(t * 3 + p.n);
    fill(red(p.c), green(p.c), blue(p.c), a);
    circle(p.x, p.y, p.r);
    // wrap
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;
  }
  pop();
}

// ---------- Helpers ----------

function windowResized() {
  resizeCanvas(windowWidth/2, windowHeight/2);
  grainG = createGraphics(width, height);
  grainG.noStroke();
  for (let i = 0; i < width * height * 0.015; i++) {
    const x = random(width);
    const y = random(height);
    const a = random(8, 22);
    grainG.fill(0, 0, 0, a);
    grainG.rect(x, y, 1, 1);
  }
}
  }
}

function keyPressed() {
  // Press 'S' to save a frame
  if (key === 's' || key === 'S') {
    saveCanvas('kandinsky_sketch', 'png');
  }
  // Press 'R' to reshuffle composition
  if (key === 'r' || key === 'R') {
    setup();
  }
}
