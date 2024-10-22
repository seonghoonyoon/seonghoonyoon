let points = [];
let length = 3;
let width = 1000;
let height = width;
let startA = [width / 2, height / 2];
let startB = [width / 2 + length, height / 2];
let angle;
function setup() {
  createCanvas(width, height);
  background(0);
  points.push(startA);
  points.push(startB);
  angle = PI/2;
}

function draw() {
  //let button = createButton("step");
  //button.id("buttons");
  //button.position(0, 18);
  strokeWeight(1);
  colorMode(HSB);
  for (let i = ceil(points.length / 2) - 1; i < points.length - 1; i++) {
    stroke((i / 120 + 360) % 360, 255, 255);
    //point(points[i][0], points[i][1]);
    line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    //ellipse(points[i][0], points[i][1], 2*(points[i+1][0] - points[i][0]), 2*(points[i+1][1] - points[i][1]));
  }
  noStroke();
  fill(0);
  rect(0, 0, 150, 30);
  fill(255);
  noStroke();
  //points.push([random(width), random(height)]);
}

function next() {
  if (points.length < 130000) {
    //angle = random(angle-0.01, angle+0.01)
    points = rot(points, points[points.length - 1]);
  }
}
/*
function keyPressed() {
  if (keyCode === ENTER) {
    if (points.length < 130000) {
      points.push(points[0]);
      points = rot(points, points[0]);
    }
  }
}
*/

function rot(points, pivot) {
  let addon = [];
  for (let i = 0; i < points.length - 1; i++) {
    let a = [points[i][0] - pivot[0], points[i][1] - pivot[1]];
    let rotated = [
      a[0] * cos(angle) - a[1] * sin(angle) + pivot[0],
      a[0] * sin(angle) + a[1] * cos(angle) + pivot[1],
    ];
    addon.push(rotated);
  }
  reverse(addon);
  return (points = concat(points, addon));
}
