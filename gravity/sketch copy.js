let r1 = 1;
let m1;
let p1;
let v1;
let a1;
let r2 = 0.5;
let m2;
let p2;
let v2;
let a2;
let G = 0.1;
let hue = 0;

function setup() {
  createCanvas(700, 700);
  
  background(0);

  m1 = (4 / 3) * PI * r1 * r1 * r1;
  m2 = (4 / 3) * PI * r2 * r2 * r2;

  p1 = createVector(width / 2, height / 2);
  v1 = createVector(-1, 1);
  a1 = createVector(0, 0);

  p2 = createVector(width * 0.6, height * 0.75);
  v2 = createVector(-5, 5);
  a2 = createVector(0, 0);
}

function draw() {
  noStroke();
  colorMode(HSB);
  fill(hue % 360, 255, 255);
  ellipse(p1.x, p1.y, r1 * 2, r1 * 2);
  fill((hue+180) % 360, 255, 255);
  ellipse(p2.x, p2.y, r2 * 2, r2 * 2);

  // move

  let dist1 = p5.Vector.sub(p2, p1);
  let dist2 = p5.Vector.sub(p1, p2);
  let distMag = mag(dist1);
  let f1 = (G * m2) / sq(distMag);
  let f2 = (G * m1) / sq(distMag);
  a1 = p5.Vector.setMag(dist1, f1);
  a2 = p5.Vector.setMag(dist2, f2);

  v1.add(a1);
  v2.add(a2);

  //p1.add(v1);
  p2.add(v2);
  hue++;
}
