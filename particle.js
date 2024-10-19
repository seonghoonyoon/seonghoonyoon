class Particle {
  constructor(r, pos, vel, id) {
    this.r = r;
    this.m = (4 / 3) * PI * pow(r, 3);
    this.area = PI * sq(r);
    this.pos = pos;
    this.vel = vel;
    this.acc = createVector(0, gravity);
    this.fd = createVector(0, 0);
    this.cd = 0.47;
    this.id = id;
  }

  show() {
    noStroke();
    fill(20, 180, (this.r / maxRadius) * 100);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }

  move() {
    // wall collision
    let d = 0.5;
    if (this.pos.x > width - this.r) {
      this.pos.x = width - this.r - d;
      this.vel.x *= -damp;
    } else if (this.pos.x < this.r) {
      this.pos.x = this.r + d;
      this.vel.x *= -damp;
    } else if (this.pos.y > height - this.r) {
      this.pos.y = height - this.r - d;
      this.vel.y *= -damp;
    } else if (this.pos.y < this.r) {
      this.pos.y = this.r + d;
      this.vel.y *= -damp;
    }
    // drag
    this.fd.set(
      -0.5 * rho * this.vel.x * abs(this.vel.x) * this.cd * this.area,
      -0.5 * rho * this.vel.y * abs(this.vel.y) * this.cd * this.area
    );
    // Update acceleration from drag
    let acceleration = this.acc.copy().add(this.fd.div(this.m));
    // Move the particle
    this.pos.add(this.vel);
    this.vel.add(acceleration);
  }

  collide(other) {
    let impactVector = p5.Vector.sub(other.pos, this.pos);
    let d = impactVector.mag();
    if (d < this.r + other.r) {
      // Push the particles out so that they are not overlapping
      let overlap = d - (this.r + other.r);
      let dir = impactVector.copy();
      dir.setMag(overlap * 0.5);
      this.pos.add(dir);
      other.pos.sub(dir);

      // Correct the distance!
      d = this.r + other.r;
      impactVector.setMag(d);

      let mSum = this.m + other.m;
      let vDiff = p5.Vector.sub(other.vel, this.vel);
      // Particle A (this)
      let num = vDiff.dot(impactVector);
      let den = mSum * d * d;
      let deltaVA = impactVector.copy();
      deltaVA.mult((2 * other.m * num) / den);
      this.vel.add(deltaVA).mult(sqrt(damp));
      // Particle B (other)
      let deltaVB = impactVector.copy();
      deltaVB.mult((-2 * this.m * num) / den);
      other.vel.add(deltaVB).mult(sqrt(damp));
    }
  }
}
