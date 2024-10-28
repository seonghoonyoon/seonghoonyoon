let G = 0.001;
let hue = 0;
let bodies = [];
let width = 1000;
let height = 1000;

function setup() {
  createCanvas(width, height);
  //background(0);

  for (let i = 0; i < 3; i++){
    let body = new Body(random(1, 5), createVector(random(width * 0.8), random(height * 0.8)), createVector(random(-1, 1), random(-1, 1)));
    bodies.push(body);
  }
}

function draw() {
  background(0);
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      bodies[i].attract(bodies[j]);
      bodies[j].attract(bodies[i]);
    }
  }

  for (let i = 0; i < bodies.length; i++) {
    bodies[i].move();
    hue = (i + 1)/bodies.length * 360;
    bodies[i].show();
  }
}
