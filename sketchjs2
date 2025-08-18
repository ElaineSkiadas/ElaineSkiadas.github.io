// landing-sketch.js
let points = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(1.5);

  // Seed points for the moving structure
  for (let i = 0; i < 150; i++) {
    points.push({
      x: random(width),
      y: random(height),
      vx: random(-1, 1),
      vy: random(-1, 1),
    });
  }
}

function draw() {
  background(15, 15, 25, 40); // translucent background for trails

  // Move points
  for (let p of points) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
  }

  // Connect points within distance
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      let d = dist(points[i].x, points[i].y, points[j].x, points[j].y);
      if (d < 150) {
        stroke(map(d, 0, 150, 255, 50), 180, 255, 120);
        line(points[i].x, points[i].y, points[j].x, points[j].y);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
