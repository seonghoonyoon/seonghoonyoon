let cells = [];
let width = 500;
let height = width;
let size = 2;
let gen = 0;
let history = [];

function setup() {
  createCanvas(width, height);
  background(0);
  noStroke();
  let zeros = [];
  for (let i = 0; i < width / size; i++) {
    zeros[i] = 0;
  }
  for (let i = 0; i < height / size - 1; i++)
  {
    history[i] = zeros;
  }
  for (let i = 0; i < width / size; i++) {
    //cells[i] = random(0, 1);
    cells[i] = i == (width / size) / 2;
    //cells[i] = (i === 0);
  }
  history.push(cells);
}

function draw() {
  for (let j = gen; j < history.length; j++) {
    for (let i = 0; i < history[j].length; i++) {
      colorMode(HSB);
      let h = 360 - history[j][i] * 360;
      let zero = history[j][i] != 0;
      if (zero) {
        fill(h, 255, 255);
        rect(i * size, (j-gen) * size, size, size);
      }
    }
  }

  let next = [];
  for (let i = 0; i < cells.length; i++) {
    let left = cells[(i - 1 + cells.length) % cells.length];
    let state = cells[i];
    let right = cells[(i + 1 + cells.length) % cells.length];
    let newState = calculateState(left, state, right);
    next[i] = newState;
  }
  cells = next;
  console.log(cells);
  history.push(cells);
  gen++;
}

function calculateState(left, state, right) {
  if (left > 0.5 && state > 0.5 && right > 0.5) {
    return 0;
  }
  if (left > 0.5 && state > 0.5 && right < 0.5) {
    return random(left, state);
  }
  if (left > 0.5 && state < 0.5 && right > 0.5) {
    return 1-state;
  }
  if (left > 0.5 && state < 0.5 && right < 0.5) {
    return random(left);
  }
  if (left < 0.5 && state > 0.5 && right > 0.5) {
    return random(state, right);
  }
  if (left < 0.5 && state > 0.5 && right < 0.5) {
    return state;
  }
  if (left < 0.5 && state < 0.5 && right > 0.5) {
    return random(right);
  }
  if (left < 0.5 && state < 0.5 && right < 0.5) {
    return 0;
  }
}
