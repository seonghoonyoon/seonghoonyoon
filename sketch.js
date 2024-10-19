/*let numFrames = 100;
let capture;*/

let damp = 0.7;
let rho = 0.01; // density of fluid
let gravity = 0.01;
let maxRadius = 5;

let particles = [];
let checkedPairs = new Set();

function setup() {
  let canvas = createCanvas(2000, 2000);
  /*canvas.id("canvas");
  capture = new CCapture({ format: "png", name: "frames" });*/

  for (let i = 0; i < 30000 / Math.pow(maxRadius, 1.5); i++) {
    let r = Math.abs(randomGaussian(0, maxRadius)) + 1;
    let s = 2 / r;
    let pos = createVector(random(0, width), random(0, height));
    let vel = createVector(random(-s, s), random(-s, s));
    particles.push(new Particle(r, pos, vel, i));
  }
}

function draw() {
  /*if (frameCount === 1) {
    capture.start();
    console.log("starting recording...");
  }
  console.log(frameCount);
  if (frameCount === numFrames) {
    console.log("done!");
    noLoop();
    capture.stop();
    capture.save();
    return;
  }*/

  background(0, 10, 30);

  let boundary = new Rectangle(width / 2, height / 2, width, height);
  let qtree = new QuadTree(boundary, 4);
  checkedPairs.clear();

  for (let p of particles) {
    let point = new Point(p.pos.x, p.pos.y, p);
    qtree.insert(point);
  }

  qtree.show();

  for (let i = 0; i < particles.length; i++) {
    let pA = particles[i];
    let range = new Circle(pA.pos.x, pA.pos.y, pA.r * 4);
    let points = qtree.query(range);
    for (let point of points) {
      let pB = point.userData;
      if (pB !== pA) {
        let idA = pA.id;
        let idB = pB.id;
        let pair = idA < idB ? `${idA},${idB}` : `${idB},${idA}`;
        if (!checkedPairs.has(pair)) {
          pA.collide(pB);
          checkedPairs.add(pair);
        }
      }
    }
  }
  for (let p of particles) {
    p.move();
    p.show();
  }

  //capture.capture(document.getElementById("canvas"));
}
